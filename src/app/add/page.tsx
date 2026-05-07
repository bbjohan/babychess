"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { resultOptions } from "@/lib/chess";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-browser";

export default function AddGamePage() {
  const router = useRouter();
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(() => (supabaseReady ? getSupabaseBrowserClient() : null), [supabaseReady]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("Configura Supabase prima di inserire una partita.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setMessage(null);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setLoading(false);
      setMessage("Devi accedere prima di inserire una partita.");
      router.push("/login");
      return;
    }

    const payload = {
      played_at: String(formData.get("played_at") ?? ""),
      white_player: String(formData.get("white_player") ?? "").trim(),
      black_player: String(formData.get("black_player") ?? "").trim(),
      result: String(formData.get("result") ?? "1-0") as "1-0" | "0-1" | "1/2-1/2" | "*",
      event: String(formData.get("event") ?? "").trim() || null,
      site: String(formData.get("site") ?? "").trim() || null,
      round: String(formData.get("round") ?? "").trim() || null,
      pgn: String(formData.get("pgn") ?? "").trim(),
      added_by_user_id: user.id,
      added_by_email: user.email ?? null,
    };

    const { data, error } = await supabase.from("chess_games").insert(payload).select("id").single();

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Partita salvata con successo.");
    event.currentTarget.reset();

    if (data?.id) {
      router.push(`/games/${data.id}`);
    }
  };

  return (
    <SiteShell
      eyebrow="Inserimento PGN"
      title="Aggiungi una nuova partita"
      subtitle="Salva data, giocatori, risultato, PGN completo e autore dell'inserimento nel database Supabase."
    >
      {!supabaseReady ? (
        <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 text-amber-50">
          Configura le variabili ambiente prima di inserire una partita.
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Data partita</span>
            <input name="played_at" type="date" required className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50" />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Risultato</span>
            <select name="result" defaultValue="1-0" className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50">
              {resultOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Bianco</span>
            <input name="white_player" required className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50" placeholder="Nome giocatore" />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Nero</span>
            <input name="black_player" required className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50" placeholder="Nome giocatore" />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Evento</span>
            <input name="event" className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50" placeholder="Torneo, match, round..." />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Luogo</span>
            <input name="site" className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50" placeholder="Citta o piattaforma" />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Turno</span>
            <input name="round" className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50" placeholder="1, 3, final..." />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-400">PGN</span>
          <textarea
            name="pgn"
            required
            rows={14}
            className="w-full rounded-[1.5rem] border border-white/10 bg-slate-900/80 px-4 py-3 font-mono text-sm leading-6 text-white outline-none focus:border-cyan-300/50"
            placeholder={`[Event "Sample"]\n[Site "Lichess"]\n[Date "2026.05.07"]\n[Round "1"]\n[White "White Player"]\n[Black "Black Player"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`}
          />
        </label>

        {message ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-50">
            {message}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Salvataggio..." : "Salva partita"}
          </button>
          <button
            type="reset"
            className="rounded-full border border-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Pulisci
          </button>
        </div>
      </form>
    </SiteShell>
  );
}
