import test from "node:test";
import assert from "node:assert/strict";
import { createLatestRequestTracker } from "../src/lib/latestRequest";

test("a lone request is the latest", () => {
  const tracker = createLatestRequestTracker();
  const isLatest = tracker.start();
  assert.equal(isLatest(), true);
});

test("starting a new request makes the earlier one stale", () => {
  const tracker = createLatestRequestTracker();
  const summer = tracker.start();
  const fall = tracker.start();
  // Summer answers last, but Fall is the league now selected.
  assert.equal(summer(), false);
  assert.equal(fall(), true);
});

test("separate trackers do not affect each other", () => {
  const schedule = createLatestRequestTracker();
  const standings = createLatestRequestTracker();
  const scheduleRequest = schedule.start();
  standings.start();
  assert.equal(scheduleRequest(), true);
});
