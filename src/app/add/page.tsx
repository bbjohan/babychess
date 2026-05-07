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
  const [nickname, setNickname] = useState<string>("");
  const [nickError, setNickError] = useState<string | null>(null);

  const handleGamesDetected = (games: ParsedGame[]) => {
    setParsedGames(games);
  };

  const handleUploadBatch = async (games: ParsedGame[]) => {
    if (!nickname || (nickname !== "babyfeeling" && nickname !== "bb")) {
      setNickError('Inserisci come nickname "babyfeeling" o "bb" prima di caricare.');
      return;
    }

    if (!supabase) {
      setMessage("Supabase non è configurato: i dati verranno mostrati solo in locale.");
      // still proceed to show success locally (no remote insert)
    }

    setLoading(true);
    setMessage(null);

    const payloads = games.map((game) => ({
      played_at: game.played_at,
      white_player: game.white_player,
      black_player: game.black_player,
      result: game.result,
      event: game.event,
      site: game.site,
      round: game.round,
      pgn: game.pgn,
      added_by_user_id: null,
      added_by_email: nickname,
    }));

    let error = null;
    if (supabase) {
      const res = await supabase.from("chess_games").insert(payloads);
      // @ts-ignore
      error = res.error ?? null;
    }

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
    if (!nickname || (nickname !== "babyfeeling" && nickname !== "bb")) {
      setNickError('Inserisci come nickname "babyfeeling" o "bb" prima di salvare.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setMessage(null);

    const payload = {
      played_at: String(formData.get("played_at") ?? ""),
      white_player: String(formData.get("white_player") ?? "").trim(),
      black_player: String(formData.get("black_player") ?? "").trim(),
      result: String(formData.get("result") ?? "1-0") as "1-0" | "0-1" | "1/2-1/2" | "*",
      event: String(formData.get("event") ?? "").trim() || null,
      site: String(formData.get("site") ?? "").trim() || null,
      round: String(formData.get("round") ?? "").trim() || null,
      pgn: String(formData.get("pgn") ?? "").trim(),
      added_by_user_id: null,
      added_by_email: nickname,
    };

    let data = null;
    let error = null;
    if (supabase) {
      const res = await supabase.from("chess_games").insert(payload).select("id").single();
      // @ts-ignore
      data = res.data ?? null;
      // @ts-ignore
      error = res.error ?? null;
    }

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
      <div className="mb-6">
        <label className="mb-4 block text-sm">
          <span className="block text-xs uppercase tracking-widest text-gray-400">Nickname</span>
          <input value={nickname} onChange={(e)=>{setNickname(e.target.value); setNickError(null);}} placeholder="babyfeeling or bb" className="mt-1 w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400" />
          {nickError ? <div className="mt-2 text-xs text-red-400">{nickError}</div> : null}
        </label>

        <div className="mb-6 flex gap-3 border-b border-gray-700">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-4 py-2 font-semibold ${
              mode === "upload"
                ? "border-b-2 border-gray-400 text-gray-100"
                : "border-b-2 border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Carica file PGN
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`px-4 py-2 font-semibold ${
              mode === "manual"
                ? "border-b-2 border-gray-400 text-gray-100"
                : "border-b-2 border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Inserisci manualmente
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="space-y-5">
          <PgnUpload onGamesDetected={handleGamesDetected} isLoading={loading} />
          {message ? (
            <div className="border border-green-700 bg-green-900 p-4 text-green-100">
              {message}
            </div>
          ) : null}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 border border-gray-700 bg-gray-900 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Data partita</span>
              <input name="played_at" type="date" required className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400" />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Risultato</span>
              <select name="result" defaultValue="1-0" className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400">
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
              <input name="white_player" required className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400" placeholder="Nome giocatore" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Nero</span>
              <input name="black_player" required className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400" placeholder="Nome giocatore" />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Evento</span>
              <input name="event" className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400" placeholder="Torneo, match, round..." />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Luogo</span>
              <input name="site" className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400" placeholder="Citta o piattaforma" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="block text-xs uppercase tracking-widest text-gray-600">Turno</span>
              <input name="round" className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-gray-400" placeholder="1, 3, final..." />
            </label>
          </div>

          <label className="space-y-1 text-sm">
            <span className="block text-xs uppercase tracking-widest text-gray-600">PGN</span>
            <textarea
              name="pgn"
              required
              rows={14}
              className="w-full border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm leading-6 text-gray-100 outline-none focus:border-gray-400"
              placeholder={`[Event "Sample"]\n[Site "Lichess"]\n[Date "2026.05.07"]\n[Round "1"]\n[White "White Player"]\n[Black "Black Player"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`}
            />
          </label>

          {message ? (
            <div className="border border-green-700 bg-green-900 p-4 text-green-100">
              {message}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-100/10 px-5 py-2 font-semibold text-gray-100 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              {loading ? "Salvataggio..." : "Salva partita"}
            </button>
            <button
              type="reset"
              className="border border-gray-700 px-5 py-2 font-semibold text-gray-100 hover:bg-gray-800"
            >
              Pulisci
            </button>
          </div>
        </form>
      )}
    </SiteShell>
  );
}
