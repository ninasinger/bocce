import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { computeStandings } from "@/lib/standings";
import { computeAwards, type MatchData } from "@/lib/awards";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");

  const { data: teams, error: teamError } = await client
    .from("teams")
    .select("id, name")
    .eq("season_id", params.id);

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  // Fetch all match data including team IDs (needed for standings) and team names (needed for awards)
  const { data: matches, error: matchError } = await client
    .from("matches")
    .select("*")
    .eq("season_id", params.id);

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  // Build team name lookup
  const teamMap: Record<string, string> = {};
  for (const t of teams || []) {
    teamMap[t.id] = t.name;
  }

  // Determine current week from data
  const allWeeks = Array.from(
    new Set((matches || []).map((m: any) => m.week_number))
  ).sort((a: number, b: number) => a - b);

  const currentWeek = week ? Number(week) : allWeeks[allWeeks.length - 1] || 1;
  const prevWeek = currentWeek > 1 ? currentWeek - 1 : 0;

  // Normalize matches into MatchData shape for awards
  const normalized: MatchData[] = (matches || []).map((m: any) => ({
    id: m.id,
    week_number: m.week_number,
    status: m.status,
    home_team_name: teamMap[m.home_team_id] || "Unknown",
    away_team_name: teamMap[m.away_team_id] || "Unknown",
    home_total_score: m.home_total_score || 0,
    away_total_score: m.away_total_score || 0,
    home_games_won: m.home_games_won || 0,
    away_games_won: m.away_games_won || 0,
    home_match_points: m.home_match_points || 0,
    away_match_points: m.away_match_points || 0,
  }));

  // Compute current and previous week standings for Rising Star
  const currentScopedMatches = (matches || []).filter(
    (m: any) => m.week_number <= currentWeek
  );
  const prevScopedMatches = prevWeek
    ? (matches || []).filter((m: any) => m.week_number <= prevWeek)
    : [];

  const standings = computeStandings(teams || [], currentScopedMatches);
  const prevStandings = prevWeek
    ? computeStandings(teams || [], prevScopedMatches)
    : [];

  const awards = computeAwards(
    normalized,
    currentWeek,
    standings.map((s) => ({
      rank: s.rank,
      teamName: s.teamName,
      gamesWon: s.gamesWon,
      matchPoints: s.matchPoints,
    })),
    prevStandings.map((s) => ({
      rank: s.rank,
      teamName: s.teamName,
      gamesWon: s.gamesWon,
      matchPoints: s.matchPoints,
    }))
  );

  return NextResponse.json({ awards, week: currentWeek });
}
