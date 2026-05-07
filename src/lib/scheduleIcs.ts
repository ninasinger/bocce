export type IcsMatch = {
  id: string;
  weekNumber: number;
  scheduledDatetime: string;
  notes: string | null;
  courtText?: string | null;
  homeTeam: string;
  awayTeam: string;
};

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function toIcsUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function extractCourt(notes: string | null) {
  if (!notes) return "";
  const match = notes.match(/Court\s*\d+/i);
  return match ? match[0] : "";
}

export function buildIcsEvent(match: IcsMatch, dtStamp: string, _seasonName: string): string | null {
  const start = new Date(match.scheduledDatetime);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const summary = escapeIcsText(`${match.homeTeam} vs ${match.awayTeam}`);
  const location = match.courtText || extractCourt(match.notes);
  const event = [
    "BEGIN:VEVENT",
    `UID:${match.id}@bellavillabocce.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${summary}`,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    "END:VEVENT"
  ].filter((line): line is string => Boolean(line));

  return event.join("\r\n");
}

export function buildIcsCalendar(opts: {
  calendarTitle: string;
  seasonName: string;
  matches: IcsMatch[];
  now: Date;
}): string {
  const dtStamp = toIcsUtc(opts.now);
  const events = opts.matches
    .map((match) => buildIcsEvent(match, dtStamp, opts.seasonName))
    .filter((value): value is string => Boolean(value));

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BellaVilla Bocce//League Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(opts.calendarTitle)}`,
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}
