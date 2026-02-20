import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";

export async function POST() {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const client = getServiceClient();

  const [season, teams, matches, submissions, corrections] = await Promise.all([
    client.from("seasons").select("*").eq("id", session.seasonId).maybeSingle(),
    client.from("teams").select("*").eq("season_id", session.seasonId),
    client.from("matches").select("*").eq("season_id", session.seasonId),
    client.from("match_submissions").select("*").eq("season_id", session.seasonId),
    client.from("match_corrections").select("*").eq("season_id", session.seasonId)
  ]);

  if (season.error) {
    return NextResponse.json({ error: season.error.message }, { status: 500 });
  }

  return NextResponse.json({
    season: season.data,
    teams: teams.data || [],
    matches: matches.data || [],
    submissions: submissions.data || [],
    corrections: corrections.data || []
  });
}
