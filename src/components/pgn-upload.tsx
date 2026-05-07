"use client";

import { ChangeEvent, useState } from "react";
import type { ParsedGame } from "@/lib/pgn-parser";
import { parseMultipleGames } from "@/lib/pgn-parser";

type PgnUploadProps = {
  onGamesDetected: (games: ParsedGame[]) => void;
  isLoading?: boolean;
};

export function PgnUpload({ onGamesDetected, isLoading }: PgnUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = Array.from(event.currentTarget.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    setFiles(selectedFiles);
    setParsing(true);

    try {
      const allGames: ParsedGame[] = [];

      for (const file of selectedFiles) {
        if (!file.name.toLowerCase().endsWith(".pgn")) {
          setError(`${file.name} non è un file PGN valido.`);
          continue;
        }

        const text = await file.text();
        const games = parseMultipleGames(text);

        if (games.length === 0) {
          setError(`Nessuna partita trovata in ${file.name}.`);
          continue;
        }

        allGames.push(...games);
      }

      setParsing(false);

      if (allGames.length > 0) {
        onGamesDetected(allGames);
        setFiles([]);
        event.currentTarget.value = "";
      }
    } catch (err) {
      setError(`Errore nel parsing: ${err instanceof Error ? err.message : "Errore sconosciuto"}`);
      setParsing(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex w-full cursor-pointer items-center justify-center border-2 border-dashed border-gray-400 bg-gray-50 px-6 py-8 transition hover:border-black hover:bg-gray-100">
        <input
          type="file"
          accept=".pgn"
          multiple
          disabled={isLoading || parsing}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-center">
          <div className="text-sm font-medium text-black">
            {parsing ? "Parsing..." : "Trascina file PGN qui o clicca per selezionare"}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            {files.length > 0 ? `${files.length} file selezionato${files.length !== 1 ? "i" : ""}` : "Supporta più file contemporaneamente"}
          </div>
        </div>
      </label>

      {error ? (
        <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
