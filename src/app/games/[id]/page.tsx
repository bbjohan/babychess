"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import type { ChessGame } from "@/lib/chess";
import { buildGameTitle, formatAddedBy, formatPlayedDate } from "@/lib/chess";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-browser";

export default function GameDetailPage() {
  const params = useParams<{ id: string }>();
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(() => (supabaseReady ? getSupabaseBrowserClient() : null), [supabaseReady]);
  const [game, setGame] = useState<ChessGame | null>(null);
  const [loading, setLoading] = useState(supabaseReady);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !params?.id) {
      return;
    }

    const loadGame = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("chess_games")
        .select("id, played_at, white_player, black_player, result, event, site, round, pgn, added_by_user_id, added_by_email, created_at")
        .eq("id", params.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setGame(null);
        setLoading(false);
        return;
      }

      setGame(data as ChessGame);
      setLoading(false);
    };

    void loadGame();
  }, [params?.id, supabase]);

  return (
    <SiteShell
      eyebrow="Dettaglio partita"
      title="Apri il PGN completo"
      subtitle={"Controlla metadati, autore dell'inserimento e testo PGN per ogni partita conservata nel database."}
    >
      <div className="mb-6 flex gap-3">
        <Link className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10" href="/">
          Torna all&apos;elenco
        </Link>
        <Link className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200" href="/add">
          Aggiungi altra partita
        </Link>
      </div>

      {!supabaseReady ? (
        <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 text-amber-50">
          Configura Supabase per vedere i dati.
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">
          Caricamento partita...
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-400/30 bg-rose-400/10 p-6 text-rose-100">
          {error}
        </div>
      ) : game ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/75">{formatPlayedDate(game.played_at)}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{buildGameTitle(game)}</h2>
            <div className="mt-5 grid gap-4 text-sm text-slate-300">
              <div>
                <span className="block text-xs uppercase tracking-[0.24em] text-slate-400">Evento</span>
                <span>{game.event || "-"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em] text-slate-400">Luogo</span>
                <span>{game.site || "-"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em] text-slate-400">Turno</span>
                <span>{game.round || "-"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-[0.24em] text-slate-400">Aggiunta da</span>
                <span>{formatAddedBy(game)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">PGN</h3>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {game.result}
              </span>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-[1.4rem] border border-white/10 bg-slate-900/90 p-4 font-mono text-sm leading-6 text-slate-100">
              {game.pgn}
            </pre>
          </section>
        </div>
      ) : null}
    </SiteShell>
  );
}
