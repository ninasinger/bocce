import { formatTeamName } from "./display";

export type MatchData = {
  id: string;
  week_number: number;
  status: string;
  home_team_name: string;
  away_team_name: string;
  home_total_score: number;
  away_total_score: number;
  home_games_won: number;
  away_games_won: number;
  home_match_points: number;
  away_match_points: number;
};

export type StandingData = {
  rank: number;
  teamName: string;
  gamesWon: number;
  matchPoints: number;
};

export type Award = {
  id: string;
  emoji: string;
  title: string;
  team: string;
  detail: string;
};

function verified(m: MatchData) {
  return m.status === "verified" || m.status === "corrected";
}

export function computeAwards(
  allMatches: MatchData[],
  currentWeek: number,
  standings: StandingData[],
  prevStandings: StandingData[]
): Award[] {
  const weekMatches = allMatches.filter(
    (m) => m.week_number === currentWeek && verified(m)
  );

  if (weekMatches.length === 0) return [];

  const awards: Award[] = [];

  // Blowout of the Week — biggest total point differential
  const withDiff = weekMatches.map((m) => ({
    ...m,
    diff: Math.abs(m.home_total_score - m.away_total_score),
  }));
  const blowout = withDiff.sort((a, b) => b.diff - a.diff)[0];
  if (blowout && blowout.diff > 0) {
    const winner =
      blowout.home_total_score > blowout.away_total_score
        ? blowout.home_team_name
        : blowout.away_team_name;
    awards.push({
      id: "blowout",
      emoji: "\uD83D\uDCA5",
      title: "Blowout of the Week",
      team: formatTeamName(winner),
      detail: `Won by ${blowout.diff} total points`,
    });
  }

  // Nail Biter — smallest total point differential
  const nailBiter = withDiff.sort((a, b) => a.diff - b.diff)[0];
  if (nailBiter && nailBiter.diff <= 5 && nailBiter.id !== blowout?.id) {
    awards.push({
      id: "nailbiter",
      emoji: "\uD83D\uDE2C",
      title: "Nail Biter",
      team: `${formatTeamName(nailBiter.home_team_name)} vs ${formatTeamName(nailBiter.away_team_name)}`,
      detail: `Decided by just ${nailBiter.diff} points`,
    });
  }

  // Top Scorer — highest single-match total points by one team this week
  let bestScore = 0;
  let bestScorer = "";
  for (const m of weekMatches) {
    if (m.home_total_score > bestScore) {
      bestScore = m.home_total_score;
      bestScorer = m.home_team_name;
    }
    if (m.away_total_score > bestScore) {
      bestScore = m.away_total_score;
      bestScorer = m.away_team_name;
    }
  }
  if (bestScorer && bestScore > 0) {
    awards.push({
      id: "topscorer",
      emoji: "\uD83C\uDFAF",
      title: "Top Scorer",
      team: formatTeamName(bestScorer),
      detail: `${bestScore} total points in one match`,
    });
  }

  // Hot Streak — longest current win streak (consecutive weeks with more games won)
  const verifiedAll = allMatches.filter(verified);
  const teamWeeks: Record<string, Record<number, boolean>> = {};
  for (const m of verifiedAll) {
    for (const [tname, won] of [
      [m.home_team_name, m.home_games_won > m.away_games_won] as const,
      [m.away_team_name, m.away_games_won > m.home_games_won] as const,
    ]) {
      if (!teamWeeks[tname]) teamWeeks[tname] = {};
      // A team "won the week" if they won more games than the opponent
      // If they already have a false for this week, keep it false
      if (teamWeeks[tname][m.week_number] === undefined) {
        teamWeeks[tname][m.week_number] = won;
      } else {
        // Multiple matches in a week: all must be wins
        teamWeeks[tname][m.week_number] = teamWeeks[tname][m.week_number] && won;
      }
    }
  }

  let longestStreak = 0;
  let streakTeam = "";
  for (const [tname, weeks] of Object.entries(teamWeeks)) {
    let streak = 0;
    for (let w = currentWeek; w >= 1; w--) {
      if (weeks[w] === true) {
        streak++;
      } else {
        break;
      }
    }
    if (streak > longestStreak) {
      longestStreak = streak;
      streakTeam = tname;
    }
  }
  if (longestStreak >= 2) {
    awards.push({
      id: "hotstreak",
      emoji: "\uD83D\uDD25",
      title: "Hot Streak",
      team: formatTeamName(streakTeam),
      detail: `${longestStreak} weeks winning in a row`,
    });
  }

  // Rising Star — biggest rank improvement vs previous week
  if (prevStandings.length > 0 && standings.length > 0) {
    const prevRankMap: Record<string, number> = {};
    for (const s of prevStandings) prevRankMap[s.teamName] = s.rank;

    let bestImprovement = 0;
    let risingTeam = "";
    for (const s of standings) {
      const prev = prevRankMap[s.teamName];
      if (prev !== undefined) {
        const improvement = prev - s.rank;
        if (improvement > bestImprovement) {
          bestImprovement = improvement;
          risingTeam = s.teamName;
        }
      }
    }
    if (bestImprovement >= 2) {
      awards.push({
        id: "risingstar",
        emoji: "\u2B50",
        title: "Rising Star",
        team: formatTeamName(risingTeam),
        detail: `Climbed ${bestImprovement} spots in the standings`,
      });
    }
  }

  return awards;
}
