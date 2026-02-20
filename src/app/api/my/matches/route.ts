import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";

export async function GET() {
  const session = await requireRoleOrResponse("captain");
  if (session instanceof Response) return session;
  const client = getServiceClient();

  const { data, error } = await client
    .from("matches")
    .select(
      `
      id,
      week_number,
      scheduled_datetime,
      status,
      home_team:teams!matches_home_team_id_fkey(name),
      away_team:teams!matches_away_team_id_fkey(name)
    `
    )
    .or(`home_team_id.eq.${session.teamId},away_team_id.eq.${session.teamId}`)
    .order("scheduled_datetime", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matches: data });
}
