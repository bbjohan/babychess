import Link from "next/link";
import type { ChessGame } from "@/lib/chess";
import { buildGameTitle, formatAddedBy, formatPlayedDate } from "@/lib/chess";

type GameCardsProps = {
  games: ChessGame[];
};

export function GameCards({ games }: GameCardsProps) {
  if (games.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-300 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        Nessuna partita trovata con questi filtri.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/games/${game.id}`}
          className="group rounded-[1.7rem] border border-white/10 bg-white/8 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/12"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/75">
                {formatPlayedDate(game.played_at)}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">{buildGameTitle(game)}</h3>
              <p className="mt-2 text-sm text-slate-300">
                Aggiunta da {formatAddedBy(game)}
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              {game.result}
            </span>
          </div>

          <div className="mt-5 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <span className="block text-xs uppercase tracking-[0.24em] text-slate-400">Evento</span>
              <span>{game.event || "-"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-[0.24em] text-slate-400">Luogo</span>
              <span>{game.site || "-"}</span>
            </div>
          </div>

          <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-300">
            {game.pgn}
          </p>
        </Link>
      ))}
    </div>
  );
}
