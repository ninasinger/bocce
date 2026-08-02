type WeekMatch = {
  week_number: number;
  scheduled_datetime?: string | null;
  status?: string | null;
};

export function getCurrentWeek(matches: WeekMatch[]) {
  if (matches.length === 0) return 1;

  const earliestByWeek = new Map<number, number>();
  for (const match of matches) {
    if (!match.scheduled_datetime) continue;
    const time = new Date(match.scheduled_datetime).getTime();
    if (!Number.isFinite(time)) continue;
    const current = earliestByWeek.get(match.week_number);
    if (current === undefined || time < current) {
      earliestByWeek.set(match.week_number, time);
    }
  }

  if (earliestByWeek.size === 0) {
    const weeks = Array.from(new Set(matches.map((match) => match.week_number))).sort(
      (left, right) => left - right
    );
    return weeks[0] ?? 1;
  }

  const now = Date.now();
  let bestWeek = Number.POSITIVE_INFINITY;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [week, time] of earliestByWeek) {
    const distance = Math.abs(time - now);
    if (distance < bestDistance || (distance === bestDistance && week < bestWeek)) {
      bestWeek = week;
      bestDistance = distance;
    }
  }
  return bestWeek;
}
