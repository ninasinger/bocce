import { computeStandings } from "./standings";

export function buildWeeklyEmail({
  weekNumber,
  standings,
  verifiedMatches
}: {
  weekNumber: number;
  standings: ReturnType<typeof computeStandings>;
  verifiedMatches: any[];
}) {
  const standingsRows = standings
    .map(
      (row) =>
        `<tr>
          <td>${row.rank}</td>
          <td>${row.teamName}</td>
          <td>${row.gamesPlayed}</td>
          <td>${row.gamesWon}</td>
          <td>${row.matchPoints}</td>
          <td>${row.totalPoints}</td>
        </tr>`
    )
    .join(" ");

  const matchList = (matches: any[]) =>
    matches
      .map(
        (match) =>
          `<li>Week ${match.week_number}: ${match.home_team_name} vs ${match.away_team_name}</li>`
      )
      .join("");

  return {
    subject: `Week ${weekNumber} standings`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:760px;margin:0 auto;color:#1a1b1e">
      <h1 style="margin-bottom:8px;">Week ${weekNumber} Bocce Wrap-Up</h1>
      <p style="margin-top:0;color:#555;">Fresh standings, quick highlights, and who is climbing the table.</p>
      <h2 style="margin-top:28px;">Standings</h2>
      <table style="border-collapse:collapse;width:100%;">
        <thead><tr><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Rank</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Team</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Games Played</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Games Won</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Match Points</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Total Points</th></tr></thead>
        <tbody>${standingsRows}</tbody>
      </table>
      <h2>Verified matches</h2>
      <ul>${matchList(verifiedMatches)}</ul>
      <p style="margin-top:24px;color:#555;">See you on the courts next week.</p>
      </div>
    `
  };
}
