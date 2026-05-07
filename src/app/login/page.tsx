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
          className="space-y-5 border border-gray-300 bg-white p-6"
        >
          <label className="space-y-1 text-sm">
            <span className="block text-xs uppercase tracking-widest text-gray-600">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black"
              placeholder="nome@example.com"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="bg-black px-5 py-2 font-semibold text-white hover:bg-gray-800"
            >
              Invia link
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="border border-gray-300 px-5 py-2 font-semibold text-black hover:bg-gray-100"
            >
              Disconnetti
            </button>
          </div>

          {status ? (
            <div className="border border-green-300 bg-green-50 p-4 text-green-900">
              {status}
            </div>
          ) : null}
        </form>

        <aside className="border border-gray-300 bg-gray-50 p-6 text-gray-600">
          <h2 className="font-semibold text-black">Cosa serve</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li>1. Email login di Supabase attivo nel progetto.</li>
            <li>2. Variabili ambiente impostate su Vercel.</li>
            <li>3. RLS e policy applicate allo schema SQL.</li>
          </ul>
        </aside>
      </div>
    </SiteShell>
  );
}
