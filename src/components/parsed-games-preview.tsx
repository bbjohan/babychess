"use client";

import { useState } from "react";
import type { ParsedGame } from "@/lib/pgn-parser";
import { buildGameTitle, formatPlayedDate } from "@/lib/chess";

type ParsedGamesPreviewProps = {
  games: ParsedGame[];
  onSelect: (games: ParsedGame[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ParsedGamesPreview({
  games,
  onSelect,
  onCancel,
  isLoading,
}: ParsedGamesPreviewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(games.map((_, i) => i)));

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === games.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(games.map((_, i) => i)));
    }
  };

  const handleSubmit = () => {
    const selected = games.filter((_, i) => selectedIds.has(i));
    onSelect(selected);
  };

  return (
    <div className="space-y-4 border border-gray-300 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-black">
          Partite trovate: {games.length}
        </h3>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-gray-600 hover:text-black"
        >
          {selectedIds.size === games.length ? "Deseleziona tutto" : "Seleziona tutto"}
        </button>
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto border border-gray-300 bg-gray-50 p-3">
        {games.map((game, index) => (
          <label
            key={index}
            className="flex cursor-pointer items-start gap-3 border border-gray-300 bg-white p-3 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(index)}
              onChange={() => toggleSelection(index)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black">
                {buildGameTitle(game)}
              </p>
              <p className="text-xs text-gray-600">
                {formatPlayedDate(game.played_at)}
                {game.event ? ` • ${game.event}` : ""}
              </p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedIds.size === 0 || isLoading}
          className="bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Carica {selectedIds.size} partita{selectedIds.size !== 1 ? "e" : ""}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 px-4 py-2 text-black hover:bg-gray-100"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
