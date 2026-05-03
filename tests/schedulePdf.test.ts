import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFullLeagueSchedulePdf,
  buildTeamSchedulePdf,
  toTeamScheduleRows,
  type ScheduleRow
} from "../src/lib/schedulePdf";

function pdfText(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function row(overrides: Partial<ScheduleRow>): ScheduleRow {
  return {
    week: 1,
    dayText: "Thu",
    dateText: "May 7",
    timeText: "6:30 PM",
    scheduledDatetime: "2026-05-07T22:30:00.000Z",
    courtText: "Court 1",
    homeTeam: "Team A",
    awayTeam: "Team B",
    status: "scheduled",
    ...overrides
  };
}

test("full league schedule PDF uses requested labels and removes generated metadata", () => {
  const pdf = pdfText(buildFullLeagueSchedulePdf("Bocce League 2026", [row({})]));

  assert.ok(pdf.includes("John Pirelli Womens Bocce League 2026"));
  assert.ok(pdf.includes("(TEAM 1) Tj"));
  assert.ok(pdf.includes("(TEAM 2) Tj"));
  assert.ok(!pdf.includes("HOME TEAM"));
  assert.ok(!pdf.includes("AWAY TEAM"));
  assert.ok(!pdf.includes("Generated from League Scoring Hub"));
  assert.ok(!pdf.includes("1 matches"));
});

test("team schedule PDF uses league title, team subtitle, and plain matchup text", () => {
  const rows = toTeamScheduleRows("Team A", [
    row({
      homeTeam: "Team A",
      awayTeam: "Team B"
    }),
    row({
      homeTeam: "Team C",
      awayTeam: "Team A"
    })
  ]);
  const pdf = pdfText(buildTeamSchedulePdf("Bocce League 2026", "Team A", rows));

  assert.ok(pdf.includes("John Pirelli Womens Bocce League 2026"));
  assert.ok(pdf.includes("(Team A) Tj"));
  assert.ok(pdf.includes("Team A / Team B"));
  assert.ok(pdf.includes("Team C / Team A"));
  assert.ok(!pdf.includes("2 matches"));
  assert.ok(!pdf.includes("vs Team B"));
  assert.ok(!pdf.includes("at Team C"));
});

test("full league schedule PDF sorts by week, day, date/time, and court", () => {
  const pdf = pdfText(
    buildFullLeagueSchedulePdf("Bocce League 2026", [
      row({
        week: 2,
        dayText: "Tue",
        dateText: "May 12",
        scheduledDatetime: "2026-05-12T22:30:00.000Z",
        courtText: "Court 2",
        homeTeam: "Week Two",
        awayTeam: "B"
      }),
      row({
        week: 1,
        dayText: "Thu",
        dateText: "May 7",
        scheduledDatetime: "2026-05-07T22:30:00.000Z",
        courtText: "Court 2",
        homeTeam: "Court Two",
        awayTeam: "B"
      }),
      row({
        week: 1,
        dayText: "Thu",
        dateText: "May 7",
        scheduledDatetime: "2026-05-07T22:30:00.000Z",
        courtText: "Court 1",
        homeTeam: "Court One",
        awayTeam: "B"
      })
    ])
  );

  const courtOneIndex = pdf.indexOf("Court One");
  const courtTwoIndex = pdf.indexOf("Court Two");
  const weekTwoIndex = pdf.indexOf("Week Two");

  assert.ok(courtOneIndex !== -1);
  assert.ok(courtTwoIndex !== -1);
  assert.ok(weekTwoIndex !== -1);
  assert.ok(courtOneIndex < courtTwoIndex);
  assert.ok(courtTwoIndex < weekTwoIndex);
});
