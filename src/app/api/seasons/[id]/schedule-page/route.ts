import { NextResponse } from "next/server";
import { resolveSubmissionStatus } from "@/lib/submissionResolution";
import { getServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type ActiveSubmission = {
  match_id: string;
  game1_home_score: number;
  game1_away_score: number;
  game2_home_score: number;
  game2_away_score: number;
};

type CorrectionValues = {
  home_games_won?: unknown;
  away_games_won?: unknown;
  home_total_score?: unknown;
  away_total_score?: unknown;
  notes?: unknown;
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
  _request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();

  const [{ data: matches, error: matchError }, { data: teams, error: teamError }] = await Promise.all([
    client
      .from("matches")
      .select(
        `
        id,
        week_number,
        scheduled_datetime,
        status,
        notes,
        home_team_id,
        away_team_id,
        home_games_won,
        away_games_won,
        home_total_score,
        away_total_score,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `
      )
      .eq("season_id", params.id)
      .order("scheduled_datetime", { ascending: true }),
    client.from("teams").select("id, name").eq("season_id", params.id).order("name", { ascending: true })
  ]);

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }
  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  const matchIds = (matches || []).map((match) => match.id);
  const { data: submissions, error: submissionError } = matchIds.length
    ? await client
        .from("match_submissions")
        .select(
          "match_id, game1_home_score, game1_away_score, game2_home_score, game2_away_score"
        )
        .in("match_id", matchIds)
        .eq("status", "active")
        .order("submitted_at", { ascending: true })
    : { data: [], error: null };

  if (submissionError) {
    return NextResponse.json({ error: submissionError.message }, { status: 500 });
  }

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

  const submissionsByMatch = new Map<string, ActiveSubmission[]>();
  for (const submission of (submissions || []) as ActiveSubmission[]) {
    const list = submissionsByMatch.get(submission.match_id) || [];
    list.push(submission);
    submissionsByMatch.set(submission.match_id, list);
  }

  const latestCorrectionByMatch = new Map<string, MatchCorrection>();
  for (const correction of (corrections || []) as MatchCorrection[]) {
    if (!latestCorrectionByMatch.has(correction.match_id)) {
      latestCorrectionByMatch.set(correction.match_id, correction);
    }
  }

  const cleanedMatches = (matches || []).map((match) => ({
    ...match,
    notes: typeof match.notes === "string" ? match.notes.replace(/\s*-\s*EXTRA\b/gi, "") : match.notes
  })).map((match) => {
    const correction = latestCorrectionByMatch.get(match.id);
    if (correction?.new_values) {
      const correctedNotes =
        typeof correction.new_values.notes === "string" ? correction.new_values.notes : match.notes;

      return {
        ...match,
        status: "verified",
        home_games_won: numberValue(correction.new_values.home_games_won) ?? match.home_games_won,
        away_games_won: numberValue(correction.new_values.away_games_won) ?? match.away_games_won,
        home_total_score: numberValue(correction.new_values.home_total_score) ?? match.home_total_score,
        away_total_score: numberValue(correction.new_values.away_total_score) ?? match.away_total_score,
        notes: correctedNotes
      };
    }

    if (match.status === "verified") return match;
    if (match.status === "corrected") {
      return {
        ...match,
        status: "verified"
      };
    }

    if (
      match.home_games_won != null &&
      match.away_games_won != null &&
      match.home_total_score != null &&
      match.away_total_score != null
    ) {
      return {
        ...match,
        status: "verified"
      };
    }

    const matchSubmissions = submissionsByMatch.get(match.id) || [];
    if (matchSubmissions.length === 0) return match;

    const resolution = resolveSubmissionStatus(
      matchSubmissions.map((submission) => ({
        game1: {
          home: submission.game1_home_score,
          away: submission.game1_away_score
        },
        game2: {
          home: submission.game2_home_score,
          away: submission.game2_away_score
        }
      }))
    );

    if (resolution.status !== "verified") {
      return {
        ...match,
        status: resolution.status
      };
    }

    return {
      ...match,
      status: "verified",
      home_games_won: resolution.outcome.homeGamesWon,
      away_games_won: resolution.outcome.awayGamesWon,
      home_total_score: resolution.outcome.homeTotalScore,
      away_total_score: resolution.outcome.awayTotalScore
    };
  });

  return NextResponse.json(
    {
      matches: cleanedMatches,
      teams: teams || []
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
