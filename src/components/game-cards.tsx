import Link from "next/link";
import type { ChessGame } from "@/lib/chess";
import { buildGameTitle, formatAddedBy, formatPlayedDate } from "@/lib/chess";

type GameCardsProps = {
  games: ChessGame[];
};

export function GameCards({ games }: GameCardsProps) {
  if (games.length === 0) {
    return (
      <div className="border border-gray-300 bg-gray-50 p-8 text-gray-600">
        Nessuna partita trovata con questi filtri.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/games/${game.id}`}
          className="block border border-gray-300 bg-white p-5 transition hover:bg-gray-50"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {formatPlayedDate(game.played_at)}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-black">{buildGameTitle(game)}</h3>
              <p className="mt-2 text-sm text-gray-600">
                Aggiunta da {formatAddedBy(game)}
              </p>
            </div>
            <span className="border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-semibold text-black">
              {game.result}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
            <div>
              <span className="block text-xs uppercase tracking-widest text-gray-500">Evento</span>
              <span>{game.event || "-"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-widest text-gray-500">Luogo</span>
              <span>{game.site || "-"}</span>
            </div>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-5 text-gray-600 font-mono">
            {game.pgn}
          </p>
        </Link>
      ))}
    </div>
  );
}
