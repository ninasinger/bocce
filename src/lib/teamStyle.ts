const TEAM_COLORS = [
  "bg-emerald-200 text-emerald-900",
  "bg-rose-200 text-rose-900",
  "bg-sky-200 text-sky-900",
  "bg-amber-200 text-amber-900",
  "bg-violet-200 text-violet-900",
  "bg-teal-200 text-teal-900",
  "bg-lime-200 text-lime-900",
  "bg-orange-200 text-orange-900"
];

function hash(input: string) {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) >>> 0;
  }
  return value;
}

export function getTeamStyle(teamName: string) {
  const normalized = teamName.trim().toLowerCase();
  const color = TEAM_COLORS[hash(normalized) % TEAM_COLORS.length];
  const initials = teamName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return { color, initials: initials || "TM" };
}
