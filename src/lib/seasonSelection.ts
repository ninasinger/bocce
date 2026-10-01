// Seasons arrive newest first, so the first id is the default league.
export function pickSeasonId(
  seasonIds: string[],
  requested: string | null,
  remembered: string | null
) {
  if (requested && seasonIds.includes(requested)) return requested;
  if (remembered && seasonIds.includes(remembered)) return remembered;
  return seasonIds[0] || "";
}
