"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GameCards } from "@/components/game-cards";
import { SiteShell } from "@/components/site-shell";
import { emptyFilters, type ChessGame, type GameFilters } from "@/lib/chess";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-browser";

export default function HomePage() {
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(() => (supabaseReady ? getSupabaseBrowserClient() : null), [supabaseReady]);
  const [filters, setFilters] = useState<GameFilters>(emptyFilters);
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const loadGames = async () => {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("chess_games")
        .select("id, played_at, white_player, black_player, result, event, site, round, pgn, added_by_user_id, added_by_email, created_at")
        .order("played_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      const player = filters.player.trim();
      const addedBy = filters.addedBy.trim();

      if (player) {
        query = query.or(`white_player.ilike.%${player}%,black_player.ilike.%${player}%`);
      }

      if (filters.fromDate) {
        query = query.gte("played_at", filters.fromDate);
      }

      if (filters.toDate) {
        query = query.lte("played_at", filters.toDate);
      }

      if (addedBy) {
        query = query.or(`added_by_email.ilike.%${addedBy}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setGames([]);
        setLoading(false);
        return;
      }

      setGames((data ?? []) as ChessGame[]);
      setLoading(false);
    };

    void loadGames();
  }, [filters, supabase]);

  if (!supabaseReady) {
    return (
      <SiteShell
        eyebrow="BabyChess"
        title="Database partite di scacchi"
        subtitle="Setup pronto per Vercel e Supabase. Aggiungi le variabili ambiente per attivare login, ricerca e inserimento PGN."
      >
        <div className="border border-gray-300 bg-yellow-50 p-6 text-yellow-900">
          <p className="font-semibold">Configura Supabase</p>
          <p className="mt-2 text-sm">
            Imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY, poi esegui lo SQL in supabase/schema.sql.
          </p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell
      eyebrow="BabyChess"
      title="Archivia, cerca e apri ogni partita"
      subtitle="Un database Supabase per PGN, con filtri per player, data e autore dell'inserimento."
      actions={
        <div className="space-y-4 border border-gray-300 bg-gray-50 p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Player</span>
              <input
                value={filters.player}
                onChange={(event) => setFilters((current) => ({ ...current, player: event.target.value }))}
                className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black"
                placeholder="Magnus, Carlsen, Gukesh..."
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="block text-xs uppercase tracking-widest text-gray-600">Dal</span>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
                  className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="block text-xs uppercase tracking-widest text-gray-600">Al</span>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
                  className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black"
                />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Aggiunta da</span>
              <input
                value={filters.addedBy}
                onChange={(event) => setFilters((current) => ({ ...current, addedBy: event.target.value }))}
                className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black"
                placeholder="email o nome"
              />
            </label>
          </div>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link className="bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800" href="/add">
          Inserisci PGN
        </Link>
        <Link className="border border-gray-300 px-4 py-2 text-black hover:bg-gray-100" href="/login">
          Gestisci accesso
        </Link>
        <button
          type="button"
          onClick={() => setFilters(emptyFilters)}
          className="border border-gray-300 px-4 py-2 text-black hover:bg-gray-100"
        >
          Reset filtri
        </button>
      </div>

      {error ? (
        <div className="mb-6 border border-red-300 bg-red-50 p-4 text-red-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="border border-gray-300 bg-gray-50 p-8 text-gray-600">
          Caricamento partite...
        </div>
      ) : (
        <GameCards games={games} />
      )}
    </SiteShell>
  );
}
