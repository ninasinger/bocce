type WeekMatch = {
  week_number: number;
  status?: string | null;
};

const OPEN_STATUSES = new Set([
  "scheduled",
  "awaiting_submission",
  "pending_verification",
  "disputed"
]);

export function getCurrentWeek(matches: WeekMatch[]) {
  const weeks = Array.from(new Set(matches.map((match) => match.week_number))).sort(
    (left, right) => left - right
  );
  if (weeks.length === 0) return 1;

  const openWeek = weeks.find((week) =>
    matches.some(
      (match) => match.week_number === week && OPEN_STATUSES.has(match.status || "")
    )
  );

  return openWeek ?? weeks[weeks.length - 1];
}
