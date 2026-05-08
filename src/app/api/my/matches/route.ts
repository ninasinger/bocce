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
      away_team:teams!matches_away_team_id_fkey(name),
      home_games_won,
      away_games_won,
      home_total_score,
      away_total_score
    `
    )
    .or(`home_team_id.eq.${session.teamId},away_team_id.eq.${session.teamId}`)
    .order("scheduled_datetime", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const matchIds = (data || []).map((match) => match.id);
  const { data: drafts } = matchIds.length
    ? await client
        .from("match_score_drafts")
        .select("match_id")
        .in("match_id", matchIds)
        .eq("team_id", session.teamId)
    : { data: [] };
  const draftMatchIds = new Set((drafts || []).map((draft) => draft.match_id));
  const matches = (data || []).map((match) =>
    draftMatchIds.has(match.id) && (match.status === "scheduled" || match.status === "awaiting_submission")
      ? { ...match, status: "partial_score" }
      : match
  );

  return NextResponse.json({ matches });
}
