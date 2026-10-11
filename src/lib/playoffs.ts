import type { TeamRef } from "./matchFormat";

// Playoff slots remain unassigned until regular-season seeds / winners are known.
// Keep the bracket in notes so placeholder teams never enter the standings.
export function playoffDetails(notes: string | null | undefined) {
  const match = notes?.match(/^Playoffs: ([^|]+) \| ([^|]+) vs ([^|]+) \|/);
  if (!match) return null;
  return { round: match[1].trim(), homeLabel: match[2].trim(), awayLabel: match[3].trim() };
}

export function withPlayoffTeams<T extends {
  notes: string | null;
  home_team: TeamRef;
  away_team: TeamRef;
}>(match: T) {
  const playoff = playoffDetails(match.notes);
  return {
    ...match,
    playoff,
    home_team: match.home_team || (playoff ? { name: playoff.homeLabel } : null),
    away_team: match.away_team || (playoff ? { name: playoff.awayLabel } : null)
  };
}
