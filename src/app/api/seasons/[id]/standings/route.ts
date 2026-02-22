import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { computeStandings } from "@/lib/standings";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");
  const weekNumber = week ? Number(week) : null;
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

  const scopedMatches =
    weekNumber && !Number.isNaN(weekNumber)
      ? (matches || []).filter((match) => match.week_number <= weekNumber)
      : matches || [];

  const standings = computeStandings(teams || [], scopedMatches);
  return NextResponse.json({ standings });
}
