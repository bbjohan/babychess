import { parsePgn } from "pgn-parser";
import type { ChessGame } from "./chess";

export type ParsedGame = Pick<
  ChessGame,
  "white_player" | "black_player" | "result" | "event" | "site" | "round" | "pgn" | "played_at"
>;

export function extractGamesFromPgn(pgnText: string): ParsedGame[] {
  try {
    const games = parsePgn(pgnText);
    if (!Array.isArray(games)) {
      return [];
    }

    return games.map((game) => {
      const headers = game.headers || {};
      const moves = game.moves || [];

      const white = headers.White || "Unknown";
      const black = headers.Black || "Unknown";
      const result = (headers.Result || "*") as "1-0" | "0-1" | "1/2-1/2" | "*";
      const event = headers.Event || null;
      const site = headers.Site || null;
      const round = headers.Round || null;

      const dateStr = headers.Date || "";
      let played_at = new Date().toISOString().split("T")[0];
      if (dateStr && dateStr.length >= 10) {
        const normalizedDate = dateStr.replace(/\./g, "-");
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
          played_at = normalizedDate;
        }
      }

      const pgn = formatPgnText(headers, moves);

      return {
        white_player: white,
        black_player: black,
        result,
        event,
        site,
        round,
        pgn,
        played_at,
      };
    });
  } catch (error) {
    console.error("Error parsing PGN:", error);
    return [];
  }
}

function formatPgnText(
  headers: Record<string, string>,
  moves: Array<{ notation?: string; [key: string]: unknown }>,
): string {
  const headerLines = Object.entries(headers)
    .map(([key, value]) => `[${key} "${value}"]`)
    .join("\n");

  const moveLine = moves
    .map((m) => m.notation || "")
    .join(" ")
    .trim();

  return `${headerLines}\n\n${moveLine}`;
}

export function parseMultipleGames(pgnText: string): ParsedGame[] {
  const games = extractGamesFromPgn(pgnText);
  return games;
}
