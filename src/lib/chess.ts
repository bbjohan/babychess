export type ChessGame = {
  id: string;
  played_at: string;
  white_player: string;
  black_player: string;
  result: "1-0" | "0-1" | "1/2-1/2" | "*";
  event: string | null;
  site: string | null;
  round: string | null;
  pgn: string;
  added_by_user_id: string | null;
  added_by_email: string | null;
  created_at: string;
};

export type GameFilters = {
  player: string;
  fromDate: string;
  toDate: string;
  addedBy: string;
};

export const emptyFilters: GameFilters = {
  player: "",
  fromDate: "",
  toDate: "",
  addedBy: "",
};

export const resultOptions: Array<{ value: ChessGame["result"]; label: string }> = [
  { value: "1-0", label: "1-0, white" },
  { value: "0-1", label: "0-1, black" },
  { value: "1/2-1/2", label: "1/2-1/2, draw" },
  { value: "*", label: "* pending" },
];

export function buildGameTitle(game: Pick<ChessGame, "white_player" | "black_player" | "result">) {
  return `${game.white_player} vs ${game.black_player} (${game.result})`;
}

export function formatPlayedDate(dateIso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(new Date(dateIso));
}

export function formatAddedBy(game: Pick<ChessGame, "added_by_email" | "added_by_user_id">) {
  return game.added_by_email ?? game.added_by_user_id ?? "Unknown";
}
