import test from "node:test";
import assert from "node:assert/strict";
import { pickSeasonId } from "../src/lib/seasonSelection";

const FALL = "fall-id";
const SUMMER = "summer-id";

test("pickSeasonId returns an empty string when there are no seasons", () => {
  assert.equal(pickSeasonId([], null, null), "");
});

test("pickSeasonId defaults to the first (newest) season", () => {
  assert.equal(pickSeasonId([FALL, SUMMER], null, null), FALL);
});

test("pickSeasonId uses the season requested in the URL", () => {
  assert.equal(pickSeasonId([FALL, SUMMER], SUMMER, null), SUMMER);
});

test("pickSeasonId prefers the URL season over the remembered one", () => {
  assert.equal(pickSeasonId([FALL, SUMMER], FALL, SUMMER), FALL);
});

test("pickSeasonId falls back to the remembered season when the URL has none", () => {
  assert.equal(pickSeasonId([FALL, SUMMER], null, SUMMER), SUMMER);
});

test("pickSeasonId ignores a URL season that no longer exists", () => {
  assert.equal(pickSeasonId([FALL, SUMMER], "deleted-id", SUMMER), SUMMER);
});

test("pickSeasonId ignores a remembered season that no longer exists", () => {
  assert.equal(pickSeasonId([FALL, SUMMER], null, "deleted-id"), FALL);
});
