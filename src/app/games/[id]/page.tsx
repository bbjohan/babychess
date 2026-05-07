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
        <Link className="border border-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800" href="/">
          Torna all&apos;elenco
        </Link>
        <Link className="bg-gray-100/10 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800" href="/add">
          Aggiungi altra partita
        </Link>
      </div>

      {!supabaseReady ? (
        <div className="border border-yellow-700 bg-yellow-900 p-6 text-yellow-100">
          Configura Supabase per vedere i dati.
        </div>
      ) : null}

      {loading ? (
        <div className="border border-gray-700 bg-gray-900 p-8 text-gray-400">
          Caricamento partita...
        </div>
      ) : error ? (
        <div className="border border-red-700 bg-red-900 p-6 text-red-100">
          {error}
        </div>
      ) : game ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border border-gray-700 bg-gray-900 p-6">
            <p className="text-xs uppercase tracking-widest text-gray-400">{formatPlayedDate(game.played_at)}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{buildGameTitle(game)}</h2>
            <div className="mt-5 grid gap-4 text-sm">
              <div>
                <span className="block text-xs uppercase tracking-widest text-gray-400">Evento</span>
                <span className="text-gray-300">{game.event || "-"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-widest text-gray-400">Luogo</span>
                <span className="text-gray-300">{game.site || "-"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-widest text-gray-400">Turno</span>
                <span className="text-gray-300">{game.round || "-"}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-widest text-gray-400">Aggiunta da</span>
                <span className="text-gray-300">{formatAddedBy(game)}</span>
              </div>
            </div>
          </section>

          <section className="border border-gray-700 bg-gray-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-white">PGN</h3>
              <span className="border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
                {game.result}
              </span>
            </div>
            <pre className="mt-5 overflow-x-auto border border-gray-700 bg-gray-800 p-4 font-mono text-sm leading-6 text-gray-100">
              {game.pgn}
            </pre>
          </section>
        </div>
      ) : null}
    </SiteShell>
  );
}
