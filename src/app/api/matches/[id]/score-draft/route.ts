import { NextResponse } from "next/server";
import { requireRoleOrResponse } from "@/lib/api";
import { getServiceClient } from "@/lib/supabaseServer";

function nullableScore(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
}

function completeGame(home: number | null, away: number | null) {
  return home != null && away != null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireRoleOrResponse("captain");
  if (session instanceof Response) return session;

  const client = getServiceClient();
  const matchId = params.id;
  const body = await request.json();

  const { data: match, error: matchError } = await client
    .from("matches")
    .select("id, season_id, home_team_id, away_team_id")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.home_team_id !== session.teamId && match.away_team_id !== session.teamId) {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  const scores = {
    game1_home_score: nullableScore(body.game1_home_score),
    game1_away_score: nullableScore(body.game1_away_score),
    game2_home_score: nullableScore(body.game2_home_score),
    game2_away_score: nullableScore(body.game2_away_score)
  };

  const game1Complete = completeGame(scores.game1_home_score, scores.game1_away_score);
  const game2Complete = completeGame(scores.game2_home_score, scores.game2_away_score);
  const game1Partial = scores.game1_home_score != null || scores.game1_away_score != null;
  const game2Partial = scores.game2_home_score != null || scores.game2_away_score != null;

  if ((game1Partial && !game1Complete) || (game2Partial && !game2Complete)) {
    return NextResponse.json({ error: "Enter both team scores for a game before saving." }, { status: 400 });
  }

  if (!game1Complete && !game2Complete) {
    return NextResponse.json({ error: "Enter at least one complete game score before saving." }, { status: 400 });
  }

  const { error } = await client.from("match_score_drafts").upsert(
    {
      season_id: match.season_id,
      match_id: matchId,
      team_id: session.teamId,
      ...scores,
      notes: body.notes || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "match_id,team_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
