import test from "node:test";
import assert from "node:assert/strict";
import { getCurrentWeek } from "../src/lib/week";

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

test("getCurrentWeek returns 1 when there are no matches", () => {
  assert.equal(getCurrentWeek([]), 1);
});

test("getCurrentWeek picks the week whose earliest match is closest to today", () => {
  const matches = [
    { week_number: 1, scheduled_datetime: daysFromNow(-14), status: "verified" },
    { week_number: 2, scheduled_datetime: daysFromNow(-7), status: "verified" },
    { week_number: 3, scheduled_datetime: daysFromNow(0), status: "scheduled" },
    { week_number: 4, scheduled_datetime: daysFromNow(7), status: "scheduled" }
  ];
  assert.equal(getCurrentWeek(matches), 3);
});

test("getCurrentWeek ignores submission status when picking the current week", () => {
  // Week 1 still has an open match, but today lines up with week 5.
  const matches = [
    { week_number: 1, scheduled_datetime: daysFromNow(-28), status: "awaiting_submission" },
    { week_number: 5, scheduled_datetime: daysFromNow(0), status: "verified" }
  ];
  assert.equal(getCurrentWeek(matches), 5);
});

test("getCurrentWeek prefers a day-old past week over a week-away future week", () => {
  // Tuesday-night play, submitting scores on Wednesday morning.
  const matches = [
    { week_number: 5, scheduled_datetime: daysFromNow(-1), status: "awaiting_submission" },
    { week_number: 6, scheduled_datetime: daysFromNow(6), status: "scheduled" }
  ];
  assert.equal(getCurrentWeek(matches), 5);
});

test("getCurrentWeek prefers the closer upcoming week over an older past week", () => {
  // Sunday, halfway between last Tuesday and next Tuesday, closer to next.
  const matches = [
    { week_number: 5, scheduled_datetime: daysFromNow(-5), status: "verified" },
    { week_number: 6, scheduled_datetime: daysFromNow(2), status: "scheduled" }
  ];
  assert.equal(getCurrentWeek(matches), 6);
});

test("getCurrentWeek uses each week's earliest match date", () => {
  // Week 3 has an outlier late match, but its earliest is closer to today.
  const matches = [
    { week_number: 3, scheduled_datetime: daysFromNow(0), status: "scheduled" },
    { week_number: 3, scheduled_datetime: daysFromNow(30), status: "scheduled" },
    { week_number: 4, scheduled_datetime: daysFromNow(7), status: "scheduled" }
  ];
  assert.equal(getCurrentWeek(matches), 3);
});

test("getCurrentWeek falls back to the lowest week number when no matches have dates", () => {
  const matches = [
    { week_number: 3, scheduled_datetime: null, status: "scheduled" },
    { week_number: 2, scheduled_datetime: null, status: "scheduled" }
  ];
  assert.equal(getCurrentWeek(matches), 2);
});
