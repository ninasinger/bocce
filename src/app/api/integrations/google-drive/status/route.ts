import { NextResponse } from "next/server";
import { requireRoleOrResponse } from "@/lib/api";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const seasonId = url.searchParams.get("seasonId") || session.seasonId;

  const client = getServiceClient();
  const { data, error } = await client
    .from("commissioner_integrations")
    .select("id, refresh_token, commissioner_email")
    .eq("season_id", seasonId)
    .eq("provider", "google_drive")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    connected: Boolean(data?.refresh_token),
    commissionerEmail: data?.commissioner_email || null
  });
}
