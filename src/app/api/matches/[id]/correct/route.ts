import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";
import { computeOutcome, validateMatchScore } from "@/lib/scoring";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const client = getServiceClient();
  const body = await request.json();

  if (!body.reason) {
    return NextResponse.json({ error: "Correction reason required" }, { status: 400 });
  }

  const { data: match, error } = await client
    .from("matches")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const score = {
    game1: { home: Number(body.game1_home_score), away: Number(body.game1_away_score) },
    game2: { home: Number(body.game2_home_score), away: Number(body.game2_away_score) }
  };

  const validation = validateMatchScore(score, 16);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const outcome = computeOutcome(score);

  await client.from("match_corrections").insert({
    match_id: params.id,
    season_id: match.season_id,
    corrected_by: session.seasonId,
    corrected_at: new Date().toISOString(),
    reason: body.reason,
    previous_values: {
      home_games_won: match.home_games_won,
      away_games_won: match.away_games_won,
      home_total_score: match.home_total_score,
      away_total_score: match.away_total_score,
      home_match_points: match.home_match_points,
      away_match_points: match.away_match_points,
      notes: match.notes
    },
    new_values: {
      home_games_won: outcome.homeGamesWon,
      away_games_won: outcome.awayGamesWon,
      home_total_score: outcome.homeTotalScore,
      away_total_score: outcome.awayTotalScore,
      home_match_points: outcome.homeMatchPoints,
      away_match_points: outcome.awayMatchPoints,
      notes: body.notes || null
    }
  });

  await client
    .from("matches")
    .update({
      status: "corrected",
      home_games_won: outcome.homeGamesWon,
      away_games_won: outcome.awayGamesWon,
      home_total_score: outcome.homeTotalScore,
      away_total_score: outcome.awayTotalScore,
      home_match_points: outcome.homeMatchPoints,
      away_match_points: outcome.awayMatchPoints,
      notes: body.notes || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", params.id);

  await client.from("audit_log").insert({
    actor_role: "commissioner",
    actor_id: session.seasonId,
    action: "match_corrected",
    entity_type: "match",
    entity_id: params.id,
    details: { reason: body.reason }
  });

  return NextResponse.json({ status: "corrected" });
}
