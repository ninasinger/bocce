import { formatTeamName } from "./display";

export type TeamRef = { name: string } | { name: string }[] | null;

export function formatMatchTeamName(team: TeamRef, fallback = "TBD") {
  if (!team) return fallback;
  if (Array.isArray(team)) return team[0]?.name ? formatTeamName(team[0].name) : fallback;
  return team.name ? formatTeamName(team.name) : fallback;
}

export function formatMatchDateTime(
  value: string | null,
  options: Intl.DateTimeFormatOptions,
  fallback = "TBD"
) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, options);
}
