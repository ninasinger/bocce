import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { hashCode } from "@/lib/auth";
import { requireRoleOrResponse } from "@/lib/api";

export async function POST(request: Request) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const body = await request.json();

  const teamCodeHash = await hashCode(String(body.team_code));

  const client = getServiceClient();
  const { data, error } = await client
    .from("teams")
    .insert({
      season_id: session.seasonId,
      name: body.name,
      team_code_hash: teamCodeHash,
      captain_name: body.captain_name,
      members: body.members || []
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ team: data });
}
