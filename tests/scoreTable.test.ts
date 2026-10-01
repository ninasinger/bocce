import test from "node:test";
import assert from "node:assert/strict";
import { buildScoreTable } from "../src/lib/scoreTable";

test("an unplayed match shows no scores", () => {
  const table = buildScoreTable({ status: "scheduled", home_total_score: null, away_total_score: null });
  assert.equal(table.showScores, false);
  assert.equal(table.showGames, false);
  assert.equal(table.home.result, null);
  assert.equal(table.away.result, null);
});

test("a finished match with per-game scores shows games and totals", () => {
  const table = buildScoreTable({
    status: "verified",
    home_total_score: 29,
    away_total_score: 12,
    game1_home_score: 14,
    game1_away_score: 6,
    game2_home_score: 15,
    game2_away_score: 6
  });
  assert.equal(table.showScores, true);
  assert.equal(table.showGames, true);
  assert.deepEqual(table.home, { games: [14, 15], total: 29, result: "win" });
  assert.deepEqual(table.away, { games: [6, 6], total: 12, result: "loss" });
});

test("a finished match without per-game scores shows totals only", () => {
  const table = buildScoreTable({ status: "corrected", home_total_score: 20, away_total_score: 28 });
  assert.equal(table.showScores, true);
  assert.equal(table.showGames, false);
  assert.deepEqual(table.home, { games: [], total: 20, result: "loss" });
  assert.deepEqual(table.away, { games: [], total: 28, result: "win" });
});

test("equal totals mark both sides as a tie", () => {
  const table = buildScoreTable({ status: "verified", home_total_score: 25, away_total_score: 25 });
  assert.equal(table.home.result, "tie");
  assert.equal(table.away.result, "tie");
});

test("totals on a match that is not final are not shown", () => {
  const table = buildScoreTable({
    status: "pending_verification",
    home_total_score: 29,
    away_total_score: 12
  });
  assert.equal(table.showScores, false);
  assert.equal(table.home.total, null);
});
