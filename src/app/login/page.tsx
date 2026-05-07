"use client";

import { FormEvent, useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(() => (supabaseReady ? getSupabaseBrowserClient() : null), [supabaseReady]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setStatus("Configura Supabase prima di attivare l'accesso.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Ti abbiamo inviato un link di accesso via email.");
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setStatus("Sessione chiusa.");
  };

  return (
    <SiteShell
      eyebrow="Accesso Supabase"
      title="Entra con il tuo indirizzo email"
      subtitle="L'app usa l'autenticazione Supabase per tracciare chi inserisce ogni partita."
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        >
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
              placeholder="nome@example.com"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Invia link
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Disconnetti
            </button>
          </div>

          {status ? (
            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-50">
              {status}
            </div>
          ) : null}
        </form>

        <aside className="rounded-[2rem] border border-white/10 bg-white/8 p-6 text-slate-200 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <h2 className="text-lg font-semibold text-white">Cosa serve</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>1. Email login di Supabase attivo nel progetto.</li>
            <li>2. Variabili ambiente impostate su Vercel.</li>
            <li>3. RLS e policy applicate allo schema SQL.</li>
          </ul>
        </aside>
      </div>
    </SiteShell>
  );
}
