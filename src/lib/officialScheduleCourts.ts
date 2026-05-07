import { readFileSync } from "fs";
import path from "path";

export type CourtTeamRef = { name: string } | { name: string }[] | null;

function teamName(team: CourtTeamRef) {
  if (!team) return "";
  if (Array.isArray(team)) return team[0]?.name || "";
  return team.name || "";
}

function normalizeTeamName(value: string) {
  return value
    .toLowerCase()
    .replace(/donne dolci/g, "donne dolce")
    .replace(/bocce mammas/g, "bocce mamas")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function courtLookupKey(week: number, teamOne: string, teamTwo: string) {
  const teams = [normalizeTeamName(teamOne), normalizeTeamName(teamTwo)].sort();
  return `${week}|${teams[0]}|${teams[1]}`;
}

let officialCourtLookup: Map<string, string> | null = null;

function getOfficialCourtLookup() {
  if (officialCourtLookup) return officialCourtLookup;

  const lookup = new Map<string, string>();
  try {
    const csv = readFileSync(
      path.join(process.cwd(), "supabase/seeds/Bocce_Schedule_2026.csv"),
      "utf8"
    );
    const lines = csv.trim().split(/\r?\n/).slice(1);

    for (const line of lines) {
      const [date, day, week, court, teamOne, teamTwo] = line.split(",");
      void date;
      void day;
      if (!week || !court || !teamOne || !teamTwo) continue;
      if (teamOne.toLowerCase().startsWith("open") || teamTwo.toLowerCase().startsWith("open")) continue;
      lookup.set(courtLookupKey(Number(week), teamOne, teamTwo), `Court ${court}`);
    }
  } catch {
    // Fall back to notes if the packaged CSV is unavailable.
  }

  officialCourtLookup = lookup;
  return lookup;
}

export function officialCourtText(match: {
  week_number: number;
  notes: string | null;
  home_team: CourtTeamRef;
  away_team: CourtTeamRef;
}) {
  const lookup = getOfficialCourtLookup();
  const officialCourt = lookup.get(
    courtLookupKey(match.week_number, teamName(match.home_team), teamName(match.away_team))
  );
  if (officialCourt) return officialCourt;
  const noteCourt = match.notes?.match(/Court\s*\d+/i)?.[0] || "";
  return noteCourt;
}

export function courtSortValue(courtText: string | null | undefined) {
  const match = courtText?.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}
