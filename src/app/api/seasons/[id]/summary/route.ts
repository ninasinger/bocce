import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { computeAwards, type MatchData } from "@/lib/awards";
import { computeStandings } from "@/lib/standings";
import { getCurrentWeek } from "@/lib/week";

function getPublishedStandingsWeek(currentWeek: number) {
  const etWeekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/New_York"
  }).format(new Date());
  const isFridayOrLater = etWeekday === "Fri" || etWeekday === "Sat" || etWeekday === "Sun";
  return isFridayOrLater ? currentWeek : Math.max(1, currentWeek - 1);
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();

  const [{ data: teams, error: teamError }, { data: matches, error: matchError }] = await Promise.all([
    client.from("teams").select("id, name").eq("season_id", params.id),
    client
      .from("matches")
      .select(
        `
        id,
        week_number,
        scheduled_datetime,
        status,
        notes,
        home_team_id,
        away_team_id,
        home_games_won,
        away_games_won,
        home_total_score,
        away_total_score,
        home_match_points,
        away_match_points,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `
      )
      .eq("season_id", params.id)
      .order("scheduled_datetime", { ascending: true })
  ]);

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }
  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const allMatches = matches || [];
  const currentWeek = getCurrentWeek(allMatches);
  const standingsWeek = getPublishedStandingsWeek(currentWeek);

  const standingsMatches = allMatches.filter((match) => match.week_number <= standingsWeek);
  const standings = computeStandings(teams || [], standingsMatches).slice(0, 6);
  const weekMatches = allMatches.filter((match) => match.week_number === currentWeek);

  const teamMap: Record<string, string> = {};
  for (const team of teams || []) {
    teamMap[team.id] = team.name;
  }

  const normalizedMatches: MatchData[] = allMatches.map((match: any) => ({
    id: match.id,
    week_number: match.week_number,
    status: match.status,
    home_team_name: teamMap[match.home_team_id] || "Unknown",
    away_team_name: teamMap[match.away_team_id] || "Unknown",
    home_total_score: match.home_total_score || 0,
    away_total_score: match.away_total_score || 0,
    home_games_won: match.home_games_won || 0,
    away_games_won: match.away_games_won || 0,
    home_match_points: match.home_match_points || 0,
    away_match_points: match.away_match_points || 0
  }));

  const previousWeek = currentWeek > 1 ? currentWeek - 1 : 0;
  const previousStandings = previousWeek
    ? computeStandings(
        teams || [],
        allMatches.filter((match) => match.week_number <= previousWeek)
      )
    : [];

  const awards = computeAwards(
    normalizedMatches,
    currentWeek,
    standings.map((standing) => ({
      rank: standing.rank,
      teamName: standing.teamName,
      gamesWon: standing.gamesWon,
      matchPoints: standing.matchPoints
    })),
    previousStandings.map((standing) => ({
      rank: standing.rank,
      teamName: standing.teamName,
      gamesWon: standing.gamesWon,
      matchPoints: standing.matchPoints
    }))
  );

  const cleanedWeekMatches = weekMatches.map((match) => ({
    ...match,
    notes: typeof match.notes === "string" ? match.notes.replace(/\s*-\s*EXTRA\b/gi, "") : match.notes
  }));

  return NextResponse.json({
    currentWeek,
    standingsWeek,
    standings,
    matches: cleanedWeekMatches,
    awards,
    awardsWeek: currentWeek
  });
}
