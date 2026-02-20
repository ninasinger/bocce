import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";

export async function POST(
  _request: Request,
  { params }: { params: { week: string } }
) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const client = getServiceClient();

  const payload = {
    season_id: session.seasonId,
    week_number: Number(params.week),
    closed_at: new Date().toISOString(),
    closed_by: session.seasonId
  };

  const { error } = await client
    .from("weeks")
    .upsert(payload, { onConflict: "season_id,week_number" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "closed" });
}
