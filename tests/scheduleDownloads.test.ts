import test from "node:test";
import assert from "node:assert/strict";
import { buildIcsCalendar, buildIcsEvent, escapeIcsText, toIcsUtc, type IcsMatch } from "../src/lib/scheduleIcs";

test("escapeIcsText escapes backslash, newline, comma, semicolon", () => {
  assert.equal(escapeIcsText("a,b;c\nd\\e"), "a\\,b\\;c\\nd\\\\e");
});

test("escapeIcsText leaves plain text alone", () => {
  assert.equal(escapeIcsText("Bocce Week 1"), "Bocce Week 1");
});

test("toIcsUtc strips dashes, colons, and millis from ISO string", () => {
  const result = toIcsUtc(new Date("2026-05-07T22:30:00.000Z"));
  assert.equal(result, "20260507T223000Z");
});

test("buildIcsEvent produces a VEVENT with all required properties", () => {
  const match: IcsMatch = {
    id: "abc-123",
    weekNumber: 1,
    scheduledDatetime: "2026-05-07T22:30:00.000Z",
    notes: "Court 1",
    homeTeam: "Dolls with Balls",
    awayTeam: "Quattro Amici"
  };
  const event = buildIcsEvent(match, "20260101T000000Z", "Bocce League 2026");
  assert.ok(event !== null);
  const lines = event!.split("\r\n");
  assert.equal(lines[0], "BEGIN:VEVENT");
  assert.equal(lines.at(-1), "END:VEVENT");
  assert.ok(lines.includes("UID:abc-123@bellavillabocce.com"));
  assert.ok(lines.includes("DTSTAMP:20260101T000000Z"));
  assert.ok(lines.includes("DTSTART:20260507T223000Z"));
  // 2-hour duration
  assert.ok(lines.includes("DTEND:20260508T003000Z"));
  assert.ok(lines.includes("SUMMARY:Dolls with Balls vs Quattro Amici"));
  assert.ok(lines.includes("LOCATION:Court 1"));
  assert.ok(!lines.some((line) => line.startsWith("DESCRIPTION:")));
});

test("buildIcsEvent escapes special characters in summary and location", () => {
  const match: IcsMatch = {
    id: "x",
    weekNumber: 1,
    scheduledDatetime: "2026-05-07T22:30:00.000Z",
    notes: "Court 1, with notes; about play",
    homeTeam: "Comma, Team",
    awayTeam: "Semi;Team"
  };
  const event = buildIcsEvent(match, "20260101T000000Z", "Bocce League 2026")!;
  assert.ok(event.includes("SUMMARY:Comma\\, Team vs Semi\\;Team"));
  assert.ok(event.includes("LOCATION:Court 1"));
  assert.ok(!event.includes("DESCRIPTION:"));
});

test("buildIcsEvent returns null for invalid datetime", () => {
  const match: IcsMatch = {
    id: "x",
    weekNumber: 1,
    scheduledDatetime: "not-a-date",
    notes: null,
    homeTeam: "A",
    awayTeam: "B"
  };
  assert.equal(buildIcsEvent(match, "20260101T000000Z", "Season"), null);
});

test("buildIcsCalendar wraps events with required VCALENDAR header and footer", () => {
  const matches: IcsMatch[] = [
    {
      id: "m1",
      weekNumber: 1,
      scheduledDatetime: "2026-05-07T22:30:00.000Z",
      notes: "Court 1",
      homeTeam: "Dolls with Balls",
      awayTeam: "Quattro Amici"
    },
    {
      id: "m2",
      weekNumber: 1,
      scheduledDatetime: "2026-05-07T22:30:00.000Z",
      notes: "Court 2",
      homeTeam: "Let's Roll",
      awayTeam: "Bocce Stars"
    }
  ];
  const ics = buildIcsCalendar({
    calendarTitle: "Bocce League 2026",
    seasonName: "Bocce League 2026",
    matches,
    now: new Date("2026-01-01T00:00:00.000Z")
  });

  const lines = ics.split("\r\n");
  assert.equal(lines[0], "BEGIN:VCALENDAR");
  assert.equal(lines.at(-1), "END:VCALENDAR");
  assert.ok(lines.includes("VERSION:2.0"));
  assert.ok(lines.includes("PRODID:-//BellaVilla Bocce//League Schedule//EN"));
  assert.ok(lines.includes("CALSCALE:GREGORIAN"));
  assert.ok(lines.includes("METHOD:PUBLISH"));
  assert.ok(lines.includes("X-WR-CALNAME:Bocce League 2026"));
  // Two events present
  const beginCount = lines.filter((line) => line === "BEGIN:VEVENT").length;
  assert.equal(beginCount, 2);
});

test("buildIcsCalendar (full league) includes all matches", () => {
  const matches: IcsMatch[] = Array.from({ length: 5 }, (_, i) => ({
    id: `m${i}`,
    weekNumber: i + 1,
    scheduledDatetime: "2026-05-07T22:30:00.000Z",
    notes: `Court ${i + 1}`,
    homeTeam: `Home${i}`,
    awayTeam: `Away${i}`
  }));

  const ics = buildIcsCalendar({
    calendarTitle: "Bocce League 2026",
    seasonName: "Bocce League 2026",
    matches,
    now: new Date()
  });
  const beginCount = ics.split("\r\n").filter((line) => line === "BEGIN:VEVENT").length;
  assert.equal(beginCount, 5);
});

test("buildIcsCalendar skips matches with invalid datetimes", () => {
  const matches: IcsMatch[] = [
    {
      id: "good",
      weekNumber: 1,
      scheduledDatetime: "2026-05-07T22:30:00.000Z",
      notes: null,
      homeTeam: "A",
      awayTeam: "B"
    },
    {
      id: "bad",
      weekNumber: 1,
      scheduledDatetime: "totally invalid",
      notes: null,
      homeTeam: "C",
      awayTeam: "D"
    }
  ];
  const ics = buildIcsCalendar({
    calendarTitle: "T",
    seasonName: "S",
    matches,
    now: new Date()
  });
  const beginCount = ics.split("\r\n").filter((line) => line === "BEGIN:VEVENT").length;
  assert.equal(beginCount, 1);
});

test("buildIcsCalendar with empty matches still returns valid VCALENDAR", () => {
  const ics = buildIcsCalendar({
    calendarTitle: "Empty",
    seasonName: "S",
    matches: [],
    now: new Date()
  });
  assert.ok(ics.startsWith("BEGIN:VCALENDAR"));
  assert.ok(ics.endsWith("END:VCALENDAR"));
});

// Mirror the "extractCourt" logic from src/app/api/seasons/[id]/schedule.pdf/route.ts
// Kept here as a regression check on the regex behavior.
function extractCourt(notes: string | null) {
  if (!notes) return "";
  const match = notes.match(/Court\s*\d+/i);
  return match ? match[0] : "";
}

test("extractCourt pulls 'Court N' from notes regardless of casing/spacing", () => {
  assert.equal(extractCourt("Court 1"), "Court 1");
  assert.equal(extractCourt("court 6"), "court 6");
  assert.equal(extractCourt("Court  4 - rescheduled"), "Court  4");
  assert.equal(extractCourt(null), "");
  assert.equal(extractCourt(""), "");
  assert.equal(extractCourt("no court info"), "");
});
