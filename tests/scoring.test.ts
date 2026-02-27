import test from "node:test";
import assert from "node:assert/strict";
import { computeOutcome, scoresMatch, validateMatchScore, type MatchScore } from "../src/lib/scoring";

test("validateMatchScore rejects invalid values", () => {
  const negative = validateMatchScore({
    game1: { home: -1, away: 10 },
    game2: { home: 12, away: 9 }
  });
  const decimal = validateMatchScore({
    game1: { home: 10.5, away: 10 },
    game2: { home: 12, away: 9 }
  });

  assert.equal(negative.ok, false);
  assert.equal(decimal.ok, false);
});

test("computeOutcome awards game wins and total-point bonus", () => {
  const score: MatchScore = {
    game1: { home: 16, away: 10 },
    game2: { home: 14, away: 15 }
  };
  const outcome = computeOutcome(score);

  assert.deepEqual(outcome, {
    homeGamesWon: 1,
    awayGamesWon: 1,
    homeTotalScore: 30,
    awayTotalScore: 25,
    homeMatchPoints: 2,
    awayMatchPoints: 1
  });
});

test("scoresMatch compares both games exactly", () => {
  const a: MatchScore = {
    game1: { home: 10, away: 9 },
    game2: { home: 8, away: 12 }
  };
  const same: MatchScore = {
    game1: { home: 10, away: 9 },
    game2: { home: 8, away: 12 }
  };
  const different: MatchScore = {
    game1: { home: 10, away: 9 },
    game2: { home: 8, away: 11 }
  };

  assert.equal(scoresMatch(a, same), true);
  assert.equal(scoresMatch(a, different), false);
});
