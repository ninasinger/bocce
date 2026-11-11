import type { SupabaseClient } from "@supabase/supabase-js";
import { computeStandings, lastFinalWeek, type StandingRow } from "@/lib/standings";

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

export type SeasonStandings = {
  standings: StandingRow[];
  // Latest week with a final match, after any `week` cutoff.
  throughWeek: number | null;
};

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function standingNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

// Standings exactly as the Standings page shows them, with commissioner
// corrections applied. Shared by the page API and the PDF/CSV downloads.
export async function loadSeasonStandings(
  client: SupabaseClient,
  seasonId: string,
  week: number | null = null
): Promise<{ data: SeasonStandings | null; error: string | null }> {
  const { data: teams, error: teamError } = await client
    .from("teams")
    .select("id, name")
    .eq("season_id", seasonId);

  if (teamError) return { data: null, error: teamError.message };

  const { data: matches, error: matchError } = await client
    .from("matches")
    .select(
      `
      id,
      week_number,
      status,
      home_team_id,
      away_team_id,
      home_games_won,
      away_games_won,
      home_match_points,
      away_match_points,
      home_total_score,
      away_total_score
    `
    )
    .eq("season_id", seasonId);

  if (matchError) return { data: null, error: matchError.message };

  const allMatches = matches || [];
  const matchIds = allMatches.map((match) => match.id);
  const { data: corrections, error: correctionError } = matchIds.length
    ? await client
        .from("match_corrections")
        .select("match_id, corrected_at, new_values")
        .in("match_id", matchIds)
        .order("corrected_at", { ascending: false })
    : { data: [], error: null };

  if (correctionError) return { data: null, error: correctionError.message };

  const latestCorrectionByMatch = new Map<string, MatchCorrection>();
  for (const correction of (corrections || []) as MatchCorrection[]) {
    if (!latestCorrectionByMatch.has(correction.match_id)) {
      latestCorrectionByMatch.set(correction.match_id, correction);
    }
  }

  const normalizedMatches = allMatches.map((match) => {
    const correction = latestCorrectionByMatch.get(match.id);
    if (correction?.new_values) {
      const correctedMatch = {
        ...match,
        status: "corrected",
        home_games_won: numberValue(correction.new_values.home_games_won) ?? match.home_games_won,
        away_games_won: numberValue(correction.new_values.away_games_won) ?? match.away_games_won,
        home_total_score: numberValue(correction.new_values.home_total_score) ?? match.home_total_score,
        away_total_score: numberValue(correction.new_values.away_total_score) ?? match.away_total_score,
        home_match_points: numberValue(correction.new_values.home_match_points) ?? match.home_match_points,
        away_match_points: numberValue(correction.new_values.away_match_points) ?? match.away_match_points
      };
      return {
        ...correctedMatch,
        home_games_won: standingNumber(correctedMatch.home_games_won),
        away_games_won: standingNumber(correctedMatch.away_games_won),
        home_total_score: standingNumber(correctedMatch.home_total_score),
        away_total_score: standingNumber(correctedMatch.away_total_score),
        home_match_points: standingNumber(correctedMatch.home_match_points),
        away_match_points: standingNumber(correctedMatch.away_match_points)
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
        status: "verified",
        home_games_won: standingNumber(match.home_games_won),
        away_games_won: standingNumber(match.away_games_won),
        home_total_score: standingNumber(match.home_total_score),
        away_total_score: standingNumber(match.away_total_score),
        home_match_points: standingNumber(match.home_match_points),
        away_match_points: standingNumber(match.away_match_points)
      };
    }

    return {
      ...match,
      home_games_won: standingNumber(match.home_games_won),
      away_games_won: standingNumber(match.away_games_won),
      home_total_score: standingNumber(match.home_total_score),
      away_total_score: standingNumber(match.away_total_score),
      home_match_points: standingNumber(match.home_match_points),
      away_match_points: standingNumber(match.away_match_points)
    };
  });

  const scopedMatches = week
    ? normalizedMatches.filter((match) => match.week_number <= week)
    : normalizedMatches;

  return {
    data: {
      standings: computeStandings(teams || [], scopedMatches),
      throughWeek: lastFinalWeek(scopedMatches)
    },
    error: null
  };
}

// Season name plus standings, for the PDF and CSV downloads.
export async function loadStandingsExport(client: SupabaseClient, seasonId: string) {
  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("name")
    .eq("id", seasonId)
    .maybeSingle();

  if (seasonError) return { data: null, error: seasonError.message, status: 500 };
  if (!season) return { data: null, error: "Season not found", status: 404 };

  const { data, error } = await loadSeasonStandings(client, seasonId);
  if (error || !data) return { data: null, error: error || "Failed to load standings", status: 500 };

  return { data: { seasonName: season.name as string, ...data }, error: null, status: 200 };
}
