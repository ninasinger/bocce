import type { SupabaseClient } from "@supabase/supabase-js";
import { computeAwards, type MatchData } from "@/lib/awards";
import { computeStandings } from "@/lib/standings";
import { getCurrentWeek } from "@/lib/week";

export type SeasonSummary = {
  currentWeek: number;
  standings: ReturnType<typeof computeStandings>;
  matches: any[];
  awards: ReturnType<typeof computeAwards>;
  awardsWeek: number;
};

type CorrectionValues = {
  home_games_won?: unknown;
  away_games_won?: unknown;
  home_total_score?: unknown;
  away_total_score?: unknown;
  home_match_points?: unknown;
  away_match_points?: unknown;
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

export async function loadSeasonSummary(
  client: SupabaseClient,
  seasonId: string
): Promise<{ data: SeasonSummary | null; error: string | null }> {
  const [{ data: teams, error: teamError }, { data: matches, error: matchError }] = await Promise.all([
    client.from("teams").select("id, name").eq("season_id", seasonId),
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
        home_match_points,
        away_match_points,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `
      )
      .eq("season_id", seasonId)
      .order("scheduled_datetime", { ascending: true })
  ]);

  if (teamError) return { data: null, error: teamError.message };
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

  const normalizedRows = allMatches.map((match: any) => {
    const correction = latestCorrectionByMatch.get(match.id);
    if (correction?.new_values) {
      const correctedNotes =
        typeof correction.new_values.notes === "string" ? correction.new_values.notes : match.notes;

      return {
        ...match,
        status: "corrected",
        home_games_won: numberValue(correction.new_values.home_games_won) ?? match.home_games_won,
        away_games_won: numberValue(correction.new_values.away_games_won) ?? match.away_games_won,
        home_total_score: numberValue(correction.new_values.home_total_score) ?? match.home_total_score,
        away_total_score: numberValue(correction.new_values.away_total_score) ?? match.away_total_score,
        home_match_points: numberValue(correction.new_values.home_match_points) ?? match.home_match_points,
        away_match_points: numberValue(correction.new_values.away_match_points) ?? match.away_match_points,
        notes: correctedNotes
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

  const currentWeek = getCurrentWeek(normalizedRows);

  const standings = computeStandings(teams || [], normalizedRows).slice(0, 6);
  const weekMatches = normalizedRows.filter((match) => match.week_number === currentWeek);

  const teamMap: Record<string, string> = {};
  for (const team of teams || []) {
    teamMap[team.id] = team.name;
  }

  const normalizedMatches: MatchData[] = normalizedRows.map((match: any) => ({
    id: match.id,
    week_number: match.week_number,
    status: match.status,
    home_team_name: teamMap[match.home_team_id] || "Unknown",
    away_team_name: teamMap[match.away_team_id] || "Unknown",
    home_total_score: match.home_total_score || 0,
    away_total_score: match.away_total_score || 0,
    home_games_won: match.home_games_won || 0,
    away_games_won: match.away_games_won || 0,
    home_match_points: match.home_match_points || 0,
    away_match_points: match.away_match_points || 0
  }));

  const previousWeek = currentWeek > 1 ? currentWeek - 1 : 0;
  const previousStandings = previousWeek
    ? computeStandings(
        teams || [],
        normalizedRows.filter((match) => match.week_number <= previousWeek)
      )
    : [];

  const awards = computeAwards(
    normalizedMatches,
    currentWeek,
    standings.map((standing) => ({
      rank: standing.rank,
      teamName: standing.teamName,
      gamesWon: standing.gamesWon,
      matchPoints: standing.matchPoints
    })),
    previousStandings.map((standing) => ({
      rank: standing.rank,
      teamName: standing.teamName,
      gamesWon: standing.gamesWon,
      matchPoints: standing.matchPoints
    }))
  );

  const cleanedWeekMatches = weekMatches.map((match) => ({
    ...match,
    notes: typeof match.notes === "string" ? match.notes.replace(/\s*-\s*EXTRA\b/gi, "") : match.notes
  }));

  return {
    data: {
      currentWeek,
      standings,
      matches: cleanedWeekMatches,
      awards,
      awardsWeek: currentWeek
    },
    error: null
  };
}

function normalizeSeasonName(name: string, year: number) {
  return name.replace(new RegExp(`\\s*\\(${year}\\)\\s*$`), "").trim();
}

export async function loadSeasonsList(client: SupabaseClient) {
  const { data, error } = await client
    .from("seasons")
    .select("id, name, year, created_at")
    .order("created_at", { ascending: false });

  if (error) return { seasons: null, error: error.message };

  const unique = new Map<string, { id: string; name: string; year: number; created_at: string }>();
  for (const season of data || []) {
    const normalizedName = normalizeSeasonName(season.name, season.year);
    const key = `${normalizedName}::${season.year}`;
    if (!unique.has(key)) {
      unique.set(key, { ...season, name: normalizedName });
    }
  }

  const seasons = Array.from(unique.values())
    .sort((a, b) => b.year - a.year || b.created_at.localeCompare(a.created_at))
    .map(({ id, name, year }) => ({ id, name, year }));

  return { seasons, error: null };
}
