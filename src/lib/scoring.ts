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
      return { ok: false, error: "Scores must be integers." } as const;
    }
    if (game.home < 0 || game.home > 20 || game.away < 0 || game.away > 20) {
      return { ok: false, error: "Scores must be between 0 and 20." } as const;
    }
    const homeIsTarget = game.home === targetPoints;
    const awayIsTarget = game.away === targetPoints;
    if (homeIsTarget === awayIsTarget) {
      return {
        ok: false,
        error: `Each game must have exactly one team scoring ${targetPoints}.`
      } as const;
    }
    if (homeIsTarget && game.away >= targetPoints) {
      return {
        ok: false,
        error: `When a team scores ${targetPoints}, the opponent must be below ${targetPoints}.`
      } as const;
    }
    if (awayIsTarget && game.home >= targetPoints) {
      return {
        ok: false,
        error: `When a team scores ${targetPoints}, the opponent must be below ${targetPoints}.`
      } as const;
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
