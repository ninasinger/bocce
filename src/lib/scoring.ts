export type GameScore = {
  home: number;
  away: number;
};

export type MatchScore = {
  game1: GameScore;
  game2: GameScore;
};

export type ComputedOutcome = {
  homeGamesWon: number;
  awayGamesWon: number;
  homeTotalScore: number;
  awayTotalScore: number;
  homeMatchPoints: number;
  awayMatchPoints: number;
};

export function validateMatchScore(score: MatchScore, targetPoints = 16) {
  const games = [score.game1, score.game2];
  for (const game of games) {
    if (!Number.isInteger(game.home) || !Number.isInteger(game.away)) {
      return { ok: false, error: "Scores must be whole numbers." } as const;
    }
    if (game.home < 0 || game.away < 0) {
      return { ok: false, error: "Scores must be zero or greater." } as const;
    }
  }
  return { ok: true } as const;
}

export function computeOutcome(score: MatchScore): ComputedOutcome {
  const games = [score.game1, score.game2];
  const homeGamesWon = games.filter((g) => g.home > g.away).length;
  const awayGamesWon = games.filter((g) => g.away > g.home).length;
  const homeTotalScore = games.reduce((sum, g) => sum + g.home, 0);
  const awayTotalScore = games.reduce((sum, g) => sum + g.away, 0);

  let homeMatchPoints = homeGamesWon;
  let awayMatchPoints = awayGamesWon;

  if (homeTotalScore > awayTotalScore) homeMatchPoints += 1;
  if (awayTotalScore > homeTotalScore) awayMatchPoints += 1;

  return {
    homeGamesWon,
    awayGamesWon,
    homeTotalScore,
    awayTotalScore,
    homeMatchPoints,
    awayMatchPoints
  };
}

export function scoresMatch(a: MatchScore, b: MatchScore) {
  return (
    a.game1.home === b.game1.home &&
    a.game1.away === b.game1.away &&
    a.game2.home === b.game2.home &&
    a.game2.away === b.game2.away
  );
}
