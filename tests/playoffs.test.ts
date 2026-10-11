import assert from "node:assert/strict";
import test from "node:test";
import { playoffDetails, withPlayoffTeams } from "../src/lib/playoffs";

test("unassigned playoff participants use seeds and winners without adding teams", () => {
  const notes = "Playoffs: Semifinal 1 | Seed 1 vs Seed 4 | Court 3";
  assert.deepEqual(playoffDetails(notes), { round: "Semifinal 1", homeLabel: "Seed 1", awayLabel: "Seed 4" });
  const match = withPlayoffTeams({ notes, home_team: null, away_team: null });
  assert.deepEqual(match.home_team, { name: "Seed 1" });
  assert.deepEqual(match.away_team, { name: "Seed 4" });
  assert.equal(playoffDetails("Court 3"), null);
  assert.equal(playoffDetails(null), null);
});

test("assigned playoff teams take precedence over bracket placeholders", () => {
  const team = { id: "polinas", name: "Pauline's Polinas" };
  const match = withPlayoffTeams({
    notes: "Playoffs: Championship | Winner SF1 vs Winner SF2 | Court 3; after semifinals",
    home_team: team, away_team: null
  });
  assert.equal(match.home_team, team);
  assert.deepEqual(match.away_team, { name: "Winner SF2" });
});
