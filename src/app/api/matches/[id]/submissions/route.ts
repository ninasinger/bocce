import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";
import { computeOutcome, validateMatchScore, type MatchScore } from "@/lib/scoring";
import { resolveSubmissionStatus } from "@/lib/submissionResolution";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;

  const client = getServiceClient();
  const { data, error } = await client
    .from("match_submissions")
    .select(
      `
      *,
      submitted_team:teams!match_submissions_submitted_by_team_id_fkey(name)
    `
    )
    .eq("match_id", params.id)
    .eq("status", "active")
    .order("submitted_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data || [] });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireRoleOrResponse("captain");
  if (session instanceof Response) return session;
  const client = getServiceClient();
  const body = await request.json();

  const matchId = params.id;
  const { data: match, error: matchError } = await client
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (
    match.home_team_id !== session.teamId &&
    match.away_team_id !== session.teamId
  ) {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  const existing = await client
    .from("match_submissions")
    .select("id")
    .eq("match_id", matchId)
    .eq("submitted_by_team_id", session.teamId)
    .eq("status", "active")
    .maybeSingle();

  if (existing.data) {
    return NextResponse.json({ error: "Submission already exists" }, { status: 409 });
  }

  const score = {
    game1: { home: Number(body.game1_home_score), away: Number(body.game1_away_score) },
    game2: { home: Number(body.game2_home_score), away: Number(body.game2_away_score) }
  };

  const validation = validateMatchScore(score, 16);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const computed = computeOutcome(score);

  const { error: insertError } = await client.from("match_submissions").insert({
    match_id: matchId,
    season_id: match.season_id,
    submitted_by_team_id: session.teamId,
    submitted_at: new Date().toISOString(),
    game1_home_score: score.game1.home,
    game1_away_score: score.game1.away,
    game2_home_score: score.game2.home,
    game2_away_score: score.game2.away,
    notes: body.notes || null,
    home_total_score: computed.homeTotalScore,
    away_total_score: computed.awayTotalScore,
    home_games_won: computed.homeGamesWon,
    away_games_won: computed.awayGamesWon,
    status: "active"
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: submissions } = await client
    .from("match_submissions")
    .select("*")
    .eq("match_id", matchId)
    .eq("status", "active");

  if (!submissions || submissions.length < 2) {
    const { error: pendingError } = await client
      .from("matches")
      .update({
        status: "pending_verification",
        updated_by_role: "system",
        updated_by_id: null
      })
      .eq("id", matchId);
    if (pendingError) {
      return NextResponse.json({ error: pendingError.message }, { status: 500 });
    }

    return NextResponse.json({ status: "pending_verification" });
  }

  const [first] = submissions;
  const submissionScores: MatchScore[] = submissions.map((submission) => ({
    game1: {
      home: submission.game1_home_score,
      away: submission.game1_away_score
    },
    game2: {
      home: submission.game2_home_score,
      away: submission.game2_away_score
    }
  }));
  const resolution = resolveSubmissionStatus(submissionScores);

  if (resolution.status === "disputed") {
    const { error: disputedError } = await client
      .from("matches")
      .update({
        status: "disputed",
        updated_by_role: "system",
        updated_by_id: null
      })
      .eq("id", matchId);
    if (disputedError) {
      return NextResponse.json({ error: disputedError.message }, { status: 500 });
    }

    const { error: auditError } = await client.from("audit_log").insert({
      actor_role: "system",
      action: "match_disputed",
      entity_type: "match",
      entity_id: matchId,
      details: { reason: "Submission mismatch" }
    });
    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 500 });
    }

    return NextResponse.json({ status: "disputed" });
  }

  if (resolution.status === "pending_verification") {
    const { error: pendingError } = await client
      .from("matches")
      .update({
        status: "pending_verification",
        updated_by_role: "system",
        updated_by_id: null
      })
      .eq("id", matchId);
    if (pendingError) {
      return NextResponse.json({ error: pendingError.message }, { status: 500 });
    }

    return NextResponse.json({ status: "pending_verification" });
  }

  const { outcome } = resolution;
  const { error: verifyError } = await client
    .from("matches")
    .update({
      status: "verified",
      home_games_won: outcome.homeGamesWon,
      away_games_won: outcome.awayGamesWon,
      home_total_score: outcome.homeTotalScore,
      away_total_score: outcome.awayTotalScore,
      home_match_points: outcome.homeMatchPoints,
      away_match_points: outcome.awayMatchPoints,
      notes: first.notes || null,
      updated_by_role: "system",
      updated_by_id: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", matchId);
  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 500 });
  }

  const { error: auditError } = await client.from("audit_log").insert({
    actor_role: "system",
    action: "match_verified",
    entity_type: "match",
    entity_id: matchId
  });
  if (auditError) {
    return NextResponse.json({ error: auditError.message }, { status: 500 });
  }

  return NextResponse.json({ status: "verified" });
}
