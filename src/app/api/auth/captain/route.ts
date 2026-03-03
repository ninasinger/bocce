import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { createSessionCookie, verifyCode } from "@/lib/auth";

export async function POST(request: Request) {
  const referer = request.headers.get("referer");
  if (!referer) {
    return NextResponse.json(
      { error: "Captain login is only available from the Score Entry page." },
      { status: 403 }
    );
  }

  try {
    const refererUrl = new URL(referer);
    if (refererUrl.pathname !== "/captain/login") {
      return NextResponse.json(
        { error: "Captain login is only available from the Score Entry page." },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Captain login is only available from the Score Entry page." },
      { status: 403 }
    );
  }

  const { teamCode, teamId } = await request.json();
  if (!teamCode || !teamId) {
    return NextResponse.json({ error: "Missing team selection or code" }, { status: 400 });
  }

  const client = getServiceClient();
  const { data: team, error } = await client
    .from("teams")
    .select("id, season_id, team_code_hash")
    .eq("id", teamId)
    .maybeSingle();

  if (error || !team) {
    return NextResponse.json({ error: "Invalid team code" }, { status: 401 });
  }

  const valid = await verifyCode(String(teamCode), team.team_code_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid team code" }, { status: 401 });
  }

  await createSessionCookie({ role: "captain", teamId: team.id, seasonId: team.season_id });
  return NextResponse.json({ ok: true });
}
