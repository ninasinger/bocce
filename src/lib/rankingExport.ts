import { toCsv } from "@/lib/csv";
import type { StandingRow } from "@/lib/standings";

export function toRankingCsv(rows: StandingRow[]) {
  return toCsv(
    ["RANK", "TEAM", "GAMES PLAYED", "GAMES WON", "TOTAL SCORES", "TOTAL POINTS"],
    rows.map((row) => [
      row.rank,
      row.teamName,
      row.gamesPlayed,
      row.gamesWon,
      row.totalPoints,
      row.matchPoints
    ])
  );
}
