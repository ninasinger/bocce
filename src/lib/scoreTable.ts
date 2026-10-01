export type ScoreTableMatch = {
  status: string;
  home_total_score: number | null;
  away_total_score: number | null;
  game1_home_score?: number | null;
  game1_away_score?: number | null;
  game2_home_score?: number | null;
  game2_away_score?: number | null;
};

export type SideResult = "win" | "loss" | "tie" | null;
export type ScoreSide = { games: number[]; total: number | null; result: SideResult };
export type ScoreTable = {
  showScores: boolean;
  showGames: boolean;
  home: ScoreSide;
  away: ScoreSide;
};

const FINAL_STATUSES = new Set(["verified", "corrected"]);

function sideResult(own: number, other: number): SideResult {
  if (own === other) return "tie";
  return own > other ? "win" : "loss";
}

// What a schedule card shows: nothing until the match is final, then the
// totals, plus game-by-game scores when all four were recorded.
export function buildScoreTable(match: ScoreTableMatch): ScoreTable {
  const homeTotal = match.home_total_score;
  const awayTotal = match.away_total_score;
  if (!FINAL_STATUSES.has(match.status) || homeTotal == null || awayTotal == null) {
    const empty: ScoreSide = { games: [], total: null, result: null };
    return { showScores: false, showGames: false, home: empty, away: { ...empty } };
  }

  const homeGames = [match.game1_home_score, match.game2_home_score];
  const awayGames = [match.game1_away_score, match.game2_away_score];
  const showGames = [...homeGames, ...awayGames].every((score) => score != null);

  return {
    showScores: true,
    showGames,
    home: {
      games: showGames ? (homeGames as number[]) : [],
      total: homeTotal,
      result: sideResult(homeTotal, awayTotal)
    },
    away: {
      games: showGames ? (awayGames as number[]) : [],
      total: awayTotal,
      result: sideResult(awayTotal, homeTotal)
    }
  };
}
