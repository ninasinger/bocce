import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { computeStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

type CorrectionValues = {
  home_games_won?: unknown;
  away_games_won?: unknown;
  home_total_score?: unknown;
  away_total_score?: unknown;
  home_match_points?: unknown;
  away_match_points?: unknown;
};

type MatchCorrection = {
  match_id: string;
  corrected_at: string;
  new_values: CorrectionValues | null;
};

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");
  const requestedWeek = week ? Number(week) : null;
  const { data: teams, error: teamError } = await client
    .from("teams")
    .select("id, name")
    .eq("season_id", params.id);

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  const { data: matches, error: matchError } = await client
    .from("matches")
    .select("*")
    .eq("season_id", params.id);

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const allMatches = matches || [];
  const matchIds = allMatches.map((match) => match.id);
  const { data: corrections, error: correctionError } = matchIds.length
    ? await client
        .from("match_corrections")
        .select("match_id, corrected_at, new_values")
        .in("match_id", matchIds)
        .order("corrected_at", { ascending: false })
    : { data: [], error: null };

  if (correctionError) {
    return NextResponse.json({ error: correctionError.message }, { status: 500 });
  }

  const latestCorrectionByMatch = new Map<string, MatchCorrection>();
  for (const correction of (corrections || []) as MatchCorrection[]) {
    if (!latestCorrectionByMatch.has(correction.match_id)) {
      latestCorrectionByMatch.set(correction.match_id, correction);
    }
  }

  const normalizedMatches = allMatches.map((match) => {
    const correction = latestCorrectionByMatch.get(match.id);
    if (correction?.new_values) {
      return {
        ...match,
        status: "corrected",
        home_games_won: numberValue(correction.new_values.home_games_won) ?? match.home_games_won,
        away_games_won: numberValue(correction.new_values.away_games_won) ?? match.away_games_won,
        home_total_score: numberValue(correction.new_values.home_total_score) ?? match.home_total_score,
        away_total_score: numberValue(correction.new_values.away_total_score) ?? match.away_total_score,
        home_match_points: numberValue(correction.new_values.home_match_points) ?? match.home_match_points,
        away_match_points: numberValue(correction.new_values.away_match_points) ?? match.away_match_points
      };
    }

    if (
      match.status === "scheduled" &&
      match.home_games_won != null &&
      match.away_games_won != null &&
      match.home_total_score != null &&
      match.away_total_score != null &&
      match.home_match_points != null &&
      match.away_match_points != null
    ) {
      return {
        ...match,
        status: "verified"
      };
    }

    return match;
  });

  const weekNumber = requestedWeek && !Number.isNaN(requestedWeek) ? requestedWeek : null;
  const scopedMatches =
    weekNumber
      ? normalizedMatches.filter((match) => match.week_number <= weekNumber)
      : normalizedMatches;

  const standings = computeStandings(teams || [], scopedMatches);

  return NextResponse.json(
    { standings, week: weekNumber },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
