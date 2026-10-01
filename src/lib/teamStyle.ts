// Majolica tints for team initial circles.
const TEAM_COLORS = [
  "bg-cobalt/15 text-cobalt-deep",
  "bg-lemon/40 text-lemon-deep",
  "bg-leaf/20 text-leaf-deep",
  "bg-sky-100 text-sky-900",
  "bg-terracotta/20 text-terracotta-deep",
  "bg-slate/20 text-ink"
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
