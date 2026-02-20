import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";
import { toCsv } from "@/lib/csv";

export async function POST() {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const client = getServiceClient();

  const { data: matches, error } = await client
    .from("matches")
    .select("*")
    .eq("season_id", session.seasonId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv(
    [
      "id",
      "week_number",
      "scheduled_datetime",
      "home_team_id",
      "away_team_id",
      "status",
      "home_games_won",
      "away_games_won",
      "home_total_score",
      "away_total_score",
      "home_match_points",
      "away_match_points",
      "notes"
    ],
    (matches || []).map((m) => [
      m.id,
      m.week_number,
      m.scheduled_datetime,
      m.home_team_id,
      m.away_team_id,
      m.status,
      m.home_games_won,
      m.away_games_won,
      m.home_total_score,
      m.away_total_score,
      m.home_match_points,
      m.away_match_points,
      m.notes
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=matches.csv"
    }
  });
}
