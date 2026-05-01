import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { formatMatchTeamName } from "@/lib/matchFormat";
import { buildIcsCalendar, type IcsMatch } from "@/lib/scheduleIcs";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("name")
    .eq("id", params.id)
    .single();
  if (seasonError || !season) {
    return NextResponse.json({ error: seasonError?.message || "Season not found" }, { status: 500 });
  }

  let calendarTitle = season.name;
  let filename = `${season.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_full_league_schedule.ics`;

  if (teamId) {
    const { data: team, error: teamError } = await client
      .from("teams")
      .select("name")
      .eq("id", teamId)
      .maybeSingle();
    if (teamError || !team) {
      return NextResponse.json({ error: teamError?.message || "Team not found" }, { status: 404 });
    }
    calendarTitle = `${team.name} - ${season.name}`;
    filename = `${team.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_schedule.ics`;
  }

  let query = client
    .from("matches")
    .select(
      `
      id,
      week_number,
      scheduled_datetime,
      notes,
      home_team:teams!matches_home_team_id_fkey(id, name),
      away_team:teams!matches_away_team_id_fkey(id, name)
    `
    )
    .eq("season_id", params.id)
    .not("scheduled_datetime", "is", null)
    .order("scheduled_datetime", { ascending: true });

  if (teamId) {
    query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
  }

  const { data: matches, error: matchError } = await query;

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const icsMatches: IcsMatch[] = (matches || []).map((match) => ({
    id: match.id,
    weekNumber: match.week_number,
    scheduledDatetime: match.scheduled_datetime as string,
    notes: match.notes,
    homeTeam: formatMatchTeamName(match.home_team, "Home"),
    awayTeam: formatMatchTeamName(match.away_team, "Away")
  }));

  const calendar = buildIcsCalendar({
    calendarTitle,
    seasonName: season.name,
    matches: icsMatches,
    now: new Date()
  });

  return new NextResponse(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  });
}
