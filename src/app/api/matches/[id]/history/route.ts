import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;

  const client = getServiceClient();
  const { data, error } = await client
    .from("score_change_log")
    .select(
      "id, created_at, actor_role, actor_id, action, before_values, after_values, metadata, season_id"
    )
    .eq("match_id", params.id)
    .eq("season_id", session.seasonId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data || [] });
}
