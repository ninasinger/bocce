import test from "node:test";
import assert from "node:assert/strict";
import { type MatchScore } from "../src/lib/scoring";
import { resolveSubmissionStatus } from "../src/lib/submissionResolution";

const baseScore: MatchScore = {
  game1: { home: 16, away: 10 },
  game2: { home: 12, away: 14 }
};

test("returns pending verification until two submissions exist", () => {
  const none = resolveSubmissionStatus([]);
  const one = resolveSubmissionStatus([baseScore]);

  assert.deepEqual(none, { status: "pending_verification" });
  assert.deepEqual(one, { status: "pending_verification" });
});

test("returns disputed when the two submissions do not match", () => {
  const mismatch = resolveSubmissionStatus([
    baseScore,
    {
      game1: { home: 16, away: 10 },
      game2: { home: 12, away: 13 }
    }
  ]);

  assert.deepEqual(mismatch, { status: "disputed" });
});

test("returns verified with computed outcome when submissions match", () => {
  const resolution = resolveSubmissionStatus([baseScore, baseScore]);

  assert.equal(resolution.status, "verified");
  if (resolution.status === "verified") {
    assert.deepEqual(resolution.outcome, {
      homeGamesWon: 1,
      awayGamesWon: 1,
      homeTotalScore: 28,
      awayTotalScore: 24,
      homeMatchPoints: 2,
      awayMatchPoints: 1
    });
  }
});
