import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireRoleOrResponse("captain");
  if (session instanceof Response) return session;
  const client = getServiceClient();

  const { data: match } = await client
    .from("matches")
    .select("id, status")
    .eq("id", params.id)
    .maybeSingle();

  const { data: submission } = await client
    .from("match_submissions")
    .select("id, game1_home_score, game1_away_score, game2_home_score, game2_away_score, notes")
    .eq("match_id", params.id)
    .eq("submitted_by_team_id", session.teamId)
    .eq("status", "active")
    .maybeSingle();

  const { data: latestSubmission } = await client
    .from("match_submissions")
    .select("id, game1_home_score, game1_away_score, game2_home_score, game2_away_score, notes")
    .eq("match_id", params.id)
    .eq("status", "active")
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    status: match?.status ?? "unknown",
    submitted: Boolean(submission),
    submission: submission || null,
    prefill_submission: latestSubmission || null
  });
}
