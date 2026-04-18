export type Team = {
  id: string;
  name: string;
};

export type MatchResult = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  status: "verified" | "corrected" | string;
  home_games_won: number;
  away_games_won: number;
  home_match_points: number;
  away_match_points: number;
  home_total_score: number;
  away_total_score: number;
};

export type StandingRow = {
  teamId: string;
  teamName: string;
  gamesPlayed: number;
  gamesWon: number;
  matchPoints: number;
  totalPoints: number;
  rank: number;
};

function compareHeadToHead(
  teamA: string,
  teamB: string,
  matches: MatchResult[]
) {
  const relevant = matches.filter(
    (m) =>
      (m.home_team_id === teamA && m.away_team_id === teamB) ||
      (m.home_team_id === teamB && m.away_team_id === teamA)
  );
  const record = relevant.reduce(
    (acc, match) => {
      const isAHome = match.home_team_id === teamA;
      const aGames = isAHome ? match.home_games_won : match.away_games_won;
      const bGames = isAHome ? match.away_games_won : match.home_games_won;
      acc.aGames += aGames;
      acc.bGames += bGames;
      return acc;
    },
    { aGames: 0, bGames: 0 }
  );

  if (record.aGames === record.bGames) return 0;
  return record.aGames > record.bGames ? -1 : 1;
}

export function computeStandings(teams: Team[], matches: MatchResult[]) {
  const verified = matches.filter(
    (m) => m.status === "verified" || m.status === "corrected"
  );

  const rows = teams.map((team) => {
    const teamMatches = verified.filter(
      (m) => m.home_team_id === team.id || m.away_team_id === team.id
    );
    const totals = teamMatches.reduce(
      (acc, match) => {
        const isHome = match.home_team_id === team.id;
        acc.gamesWon += isHome ? match.home_games_won : match.away_games_won;
        acc.matchPoints += isHome ? match.home_match_points : match.away_match_points;
        acc.totalPoints += isHome ? match.home_total_score : match.away_total_score;
        return acc;
      },
      { gamesWon: 0, matchPoints: 0, totalPoints: 0 }
    );

    return {
      teamId: team.id,
      teamName: team.name,
      // Each match contains two games in the current league format.
      gamesPlayed: teamMatches.length * 2,
      gamesWon: totals.gamesWon,
      matchPoints: totals.matchPoints,
      totalPoints: totals.totalPoints,
      rank: 0
    };
  });

  rows.sort((a, b) => {
    if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
    if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;

    const head = compareHeadToHead(a.teamId, b.teamId, verified);
    if (head !== 0) return head;

    return a.teamName.localeCompare(b.teamName);
  });

  rows.forEach((row, index) => {
    if (index === 0) {
      row.rank = 1;
      return;
    }

    const prev = rows[index - 1];
    const isSameScoreline =
      row.gamesWon === prev.gamesWon &&
      row.matchPoints === prev.matchPoints &&
      row.totalPoints === prev.totalPoints;

    row.rank = isSameScoreline ? prev.rank : index + 1;
  });

  return rows;
}
