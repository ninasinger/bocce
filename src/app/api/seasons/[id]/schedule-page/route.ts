import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

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

  const cleanedMatches = (matches || []).map((match) => ({
    ...match,
    notes: typeof match.notes === "string" ? match.notes.replace(/\s*-\s*EXTRA\b/gi, "") : match.notes
  }));

  return NextResponse.json({
    matches: cleanedMatches,
    teams: teams || []
  });
}
