import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");

  let query = client
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
      home_team:teams!matches_home_team_id_fkey(name),
      away_team:teams!matches_away_team_id_fkey(name)
    `
    )
    .eq("season_id", params.id);
  if (week) {
    query = query.eq("week_number", Number(week));
  }

  const { data, error } = await query.order("scheduled_datetime", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matches: data });
}
