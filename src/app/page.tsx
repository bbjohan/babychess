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
        <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 text-amber-50">
          <p className="text-lg font-semibold">Configura Supabase</p>
          <p className="mt-2 text-sm leading-6 text-amber-100/90">
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
      subtitle="Un database Supabase per PGN, con filtri per player, data e autore dell'inserimento. Tutto pronto per il deploy su Vercel."
      actions={
        <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Player</span>
            <input
              value={filters.player}
              onChange={(event) => setFilters((current) => ({ ...current, player: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300/50"
              placeholder="Magnus, Carlsen, Gukesh..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Dal</span>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Al</span>
              <input
                type="date"
                value={filters.toDate}
                onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Aggiunta da</span>
            <input
              value={filters.addedBy}
              onChange={(event) => setFilters((current) => ({ ...current, addedBy: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
              placeholder="email o nome"
            />
          </label>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link className="rounded-full bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-200" href="/add">
          Inserisci PGN
        </Link>
        <Link className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/10" href="/login">
          Gestisci accesso
        </Link>
        <button
          type="button"
          onClick={() => setFilters(emptyFilters)}
          className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/10"
        >
          Reset filtri
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300">
          Caricamento partite...
        </div>
      ) : (
        <GameCards games={games} />
      )}
    </SiteShell>
  );
}
