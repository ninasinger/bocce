import { computeStandings } from "./standings";

export function buildWeeklyEmail({
  weekNumber,
  standings,
  verifiedMatches,
  pendingMatches,
  disputedMatches,
  weekClosed
}: {
  weekNumber: number;
  standings: ReturnType<typeof computeStandings>;
  verifiedMatches: any[];
  pendingMatches: any[];
  disputedMatches: any[];
  weekClosed: boolean;
}) {
  const standingsRows = standings
    .map(
      (row) =>
        `<tr><td>${row.rank}</td><td>${row.teamName}</td><td>${row.gamesWon}</td><td>${row.matchPoints}</td><td>${row.totalPoints}</td></tr>`
    )
    .join(" ");

  const matchList = (matches: any[]) =>
    matches
      .map(
        (match) =>
          `<li>Week ${match.week_number}: ${match.home_team_id} vs ${match.away_team_id} (${match.status})</li>`
      )
      .join("");

  const notice = weekClosed
    ? ""
    : "<p><strong>Reminder:</strong> Week is not closed. Please review missing or disputed matches.</p>";

  return {
    subject: `Week ${weekNumber} standings`,
    html: `
      <h1>Week ${weekNumber} standings</h1>
      ${notice}
      <h2>Standings</h2>
      <table>
        <thead><tr><th>Rank</th><th>Team</th><th>Games Won</th><th>Match Points</th><th>Total Points</th></tr></thead>
        <tbody>${standingsRows}</tbody>
      </table>
      <h2>Verified matches</h2>
      <ul>${matchList(verifiedMatches)}</ul>
      <h2>Disputed matches</h2>
      <ul>${matchList(disputedMatches)}</ul>
      <h2>Missing submissions</h2>
      <ul>${matchList(pendingMatches)}</ul>
    `
  };
}
