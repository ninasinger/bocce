import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";

export async function POST(request: Request) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const body = await request.json();

  const client = getServiceClient();
  const { data, error } = await client
    .from("matches")
    .insert({
      season_id: session.seasonId,
      week_number: body.week_number,
      scheduled_datetime: body.scheduled_datetime,
      home_team_id: body.home_team_id,
      away_team_id: body.away_team_id,
      status: "scheduled"
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ match: data });
}
