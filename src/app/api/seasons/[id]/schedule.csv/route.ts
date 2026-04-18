import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { toCsv } from "@/lib/csv";
import { formatMatchTeamName } from "@/lib/matchFormat";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("name")
    .eq("id", params.id)
    .single();

  if (seasonError) {
    return NextResponse.json({ error: seasonError.message }, { status: 500 });
  }

  let query = client
    .from("matches")
    .select(
      `
      week_number,
      scheduled_datetime,
      status,
      notes,
      home_games_won,
      away_games_won,
      home_total_score,
      away_total_score,
      home_match_points,
      away_match_points,
      home_team:teams!matches_home_team_id_fkey(id, name),
      away_team:teams!matches_away_team_id_fkey(id, name)
    `
    )
    .eq("season_id", params.id);

  if (teamId) {
    query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
  }

  const { data: matches, error: matchesError } = await query.order("scheduled_datetime", {
    ascending: true
  });

  if (matchesError) {
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }

  const rows = (matches || []).map((match) => [
    season.name,
    match.week_number,
    match.scheduled_datetime,
    match.status,
    formatMatchTeamName(match.home_team, ""),
    formatMatchTeamName(match.away_team, ""),
    match.home_games_won,
    match.away_games_won,
    match.home_total_score,
    match.away_total_score,
    match.home_match_points,
    match.away_match_points,
    typeof match.notes === "string" ? match.notes.replace(/\s*-\s*EXTRA\b/gi, "") : match.notes
  ]);

  const csv = toCsv(
    [
      "season",
      "week_number",
      "scheduled_datetime",
      "status",
      "home_team",
      "away_team",
      "home_games_won",
      "away_games_won",
      "home_total_score",
      "away_total_score",
      "home_match_points",
      "away_match_points",
      "notes"
    ],
    rows
  );

  const safeSeasonName = (season.name || "season")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const filename = teamId ? `${safeSeasonName}-team-schedule.csv` : `${safeSeasonName}-schedule.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  });
}
