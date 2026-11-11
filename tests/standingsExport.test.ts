import test from "node:test";
import assert from "node:assert/strict";
import { lastFinalWeek, type StandingRow } from "../src/lib/standings";
import { toRankingCsv } from "../src/lib/rankingExport";
import { buildStandingsPdf, standingsFilename } from "../src/lib/standingsPdf";
import { estimateTextWidth } from "../src/lib/simplePdf";

function pdfText(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function standing(overrides: Partial<StandingRow>): StandingRow {
  return {
    teamId: "team",
    teamName: "Team",
    rank: 1,
    gamesPlayed: 12,
    gamesWon: 8,
    matchPoints: 12.5,
    totalPoints: 240,
    ...overrides
  };
}

const fallRows = [
  standing({ rank: 1, teamName: "Boccelism", matchPoints: 12.5 }),
  standing({ rank: 2, teamName: "Spice Balls", matchPoints: 12 }),
  standing({ rank: 3, teamName: "Pauline's Polinas", matchPoints: 7 })
];

test("lastFinalWeek is the latest week with a final match", () => {
  const matches = [
    { week_number: 5, status: "verified" },
    { week_number: 6, status: "corrected" },
    { week_number: 7, status: "scheduled" }
  ];
  assert.equal(lastFinalWeek(matches), 6);
});

test("lastFinalWeek is null before any match is final", () => {
  assert.equal(lastFinalWeek([{ week_number: 1, status: "scheduled" }]), null);
  assert.equal(lastFinalWeek([]), null);
});

test("standings CSV uses the page's column labels and keeps decimal points", () => {
  const csv = toRankingCsv(fallRows);
  const [header, first] = csv.split("\n");
  assert.equal(header, "RANK,TEAM,GAMES PLAYED,GAMES WON,TOTAL SCORES,TOTAL POINTS");
  assert.equal(first, "1,Boccelism,12,8,240,12.5");
});

test("standings CSV quotes team names that contain commas", () => {
  const csv = toRankingCsv([standing({ teamName: "Rock, Paper, Bocce" })]);
  assert.ok(csv.includes('"Rock, Paper, Bocce"'));
});

test("standings PDF names the league and the last final week", () => {
  const pdf = pdfText(buildStandingsPdf("Co-ed Fall 2026", 6, fallRows));
  assert.ok(pdf.includes("(Standings) Tj"));
  assert.ok(pdf.includes("(John Pirelli Lodge Bocce - Co-ed Fall 2026 - Through Week 6) Tj"));
});

test("standings PDF leaves out the week before any match is final", () => {
  const pdf = pdfText(buildStandingsPdf("Co-ed Fall 2026", null, fallRows));
  assert.ok(pdf.includes("(John Pirelli Lodge Bocce - Co-ed Fall 2026) Tj"));
  assert.ok(!pdf.includes("Through Week"));
});

test("standings PDF lists every column and the teams in rank order", () => {
  const pdf = pdfText(buildStandingsPdf("Co-ed Fall 2026", 6, fallRows));
  for (const label of ["RANK", "TEAM", "GAMES PLAYED", "GAMES WON", "TOTAL SCORES", "TOTAL POINTS"]) {
    assert.ok(pdf.includes(`(${label}) Tj`), label);
  }
  assert.ok(pdf.includes("(12.5) Tj"));
  const order = ["Boccelism", "Spice Balls", "Pauline's Polinas"].map((name) => pdf.indexOf(`(${name}) Tj`));
  assert.ok(order.every((index) => index !== -1));
  assert.ok(order[0] < order[1] && order[1] < order[2]);
});

test("standings PDF fits a 17-team league on one page", () => {
  const rows = Array.from({ length: 17 }, (_, index) =>
    standing({ rank: index + 1, teamName: `Team ${index + 1}` })
  );
  const pdf = pdfText(buildStandingsPdf("Women's Summer 2026", 16, rows));
  assert.ok(pdf.includes("/Count 1 "));
  assert.ok(pdf.includes("(Team 17) Tj"));
});

test("standings filenames follow the league name", () => {
  assert.equal(standingsFilename("Co-ed Fall 2026", "pdf"), "co_ed_fall_2026_standings.pdf");
  assert.equal(standingsFilename("Women's Summer 2026", "csv"), "womens_summer_2026_standings.csv");
});

test("text width estimate matches Helvetica for bold capitals and digits", () => {
  // Real Helvetica-Bold width of "TOTAL POINTS" at 9pt is 66.0pt; "12.5" at 11pt is 21.4pt.
  assert.ok(Math.abs(estimateTextWidth("TOTAL POINTS", 9, true) - 66) < 3);
  assert.ok(Math.abs(estimateTextWidth("12.5", 11) - 21.4) < 1.5);
});
