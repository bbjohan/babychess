"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { PgnUpload } from "@/components/pgn-upload";
import { ParsedGamesPreview } from "@/components/parsed-games-preview";
import { resultOptions } from "@/lib/chess";
import type { ParsedGame } from "@/lib/pgn-parser";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase-browser";

export default function AddGamePage() {
  const router = useRouter();
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(() => (supabaseReady ? getSupabaseBrowserClient() : null), [supabaseReady]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([]);
  const [mode, setMode] = useState<"manual" | "upload">("manual");

  const handleGamesDetected = (games: ParsedGame[]) => {
    setParsedGames(games);
  };

  const handleUploadBatch = async (games: ParsedGame[]) => {
    if (!supabase) {
      setMessage("Configura Supabase prima di inserire partite.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setLoading(false);
      setMessage("Devi accedere prima di inserire partite.");
      router.push("/login");
      return;
    }

    const payloads = games.map((game) => ({
      played_at: game.played_at,
      white_player: game.white_player,
      black_player: game.black_player,
      result: game.result,
      event: game.event,
      site: game.site,
      round: game.round,
      pgn: game.pgn,
      added_by_user_id: user.id,
      added_by_email: user.email ?? null,
    }));

    const { error } = await supabase.from("chess_games").insert(payloads);

    setLoading(false);

    if (error) {
      setMessage(`Errore nel caricamento: ${error.message}`);
      return;
    }

    setMessage(`${games.length} partita${games.length !== 1 ? "e" : ""} caricate con successo!`);
    setParsedGames([]);
    setTimeout(() => router.push("/"), 2000);
  };

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

  if (parsedGames.length > 0) {
    return (
      <SiteShell
        eyebrow="Caricamento file PGN"
        title="Anteprima partite"
        subtitle="Seleziona quali partite caricare nel database."
      >
        <ParsedGamesPreview
          games={parsedGames}
          onSelect={handleUploadBatch}
          onCancel={() => setParsedGames([])}
          isLoading={loading}
        />
        {message ? (
          <div className="mt-4 border border-green-300 bg-green-50 p-4 text-green-900">
            {message}
          </div>
        ) : null}
      </SiteShell>
    );
  }

  return (
    <SiteShell
      eyebrow="Inserimento PGN"
      title="Aggiungi una nuova partita"
      subtitle="Carica file PGN o inserisci manualmente i dati della partita."
    >
      {!supabaseReady ? (
        <div className="border border-yellow-300 bg-yellow-50 p-6 text-yellow-900">
          Configura le variabili ambiente prima di inserire una partita.
        </div>
      ) : null}

      <div className="mb-6 flex gap-3 border-b border-gray-300">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-4 py-2 font-semibold ${
            mode === "upload"
              ? "border-b-2 border-black text-black"
              : "border-b-2 border-transparent text-gray-600 hover:text-black"
          }`}
        >
          Carica file PGN
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`px-4 py-2 font-semibold ${
            mode === "manual"
              ? "border-b-2 border-black text-black"
              : "border-b-2 border-transparent text-gray-600 hover:text-black"
          }`}
        >
          Inserisci manualmente
        </button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-5">
          <PgnUpload onGamesDetected={handleGamesDetected} isLoading={loading} />
          {message ? (
            <div className="border border-green-300 bg-green-50 p-4 text-green-900">
              {message}
            </div>
          ) : null}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 border border-gray-300 bg-white p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Data partita</span>
              <input name="played_at" type="date" required className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black" />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Risultato</span>
              <select name="result" defaultValue="1-0" className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black">
                {resultOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Bianco</span>
              <input name="white_player" required className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black" placeholder="Nome giocatore" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Nero</span>
              <input name="black_player" required className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black" placeholder="Nome giocatore" />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Evento</span>
              <input name="event" className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black" placeholder="Torneo, match, round..." />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Luogo</span>
              <input name="site" className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black" placeholder="Citta o piattaforma" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Turno</span>
              <input name="round" className="w-full border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-black" placeholder="1, 3, final..." />
            </label>
          </div>

          <label className="space-y-1 text-sm">
            <span className="block text-xs uppercase tracking-widest text-gray-600">PGN</span>
            <textarea
              name="pgn"
              required
              rows={14}
              className="w-full border border-gray-300 bg-white px-3 py-2 font-mono text-sm leading-6 text-black outline-none focus:border-black"
              placeholder={`[Event "Sample"]\n[Site "Lichess"]\n[Date "2026.05.07"]\n[Round "1"]\n[White "White Player"]\n[Black "Black Player"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`}
            />
          </label>

          {message ? (
            <div className="border border-green-300 bg-green-50 p-4 text-green-900">
              {message}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-black px-5 py-2 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Salvataggio..." : "Salva partita"}
            </button>
            <button
              type="reset"
              className="border border-gray-300 px-5 py-2 font-semibold text-black hover:bg-gray-100"
            >
              Pulisci
            </button>
          </div>
        </form>
      )}
    </SiteShell>
  );
}
