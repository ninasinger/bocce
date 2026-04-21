import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { formatMatchTeamName } from "@/lib/matchFormat";
import {
  buildFullLeagueSchedulePdf,
  buildTeamSchedulePdf,
  toTeamScheduleRows,
  type ScheduleRow
} from "@/lib/schedulePdf";

export const runtime = "nodejs";

function formatDateTime(value: string | null) {
  if (!value) return { dateText: "TBD", timeText: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { dateText: value, timeText: "" };
  return {
    dateText: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/New_York"
    }),
    timeText: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York"
    })
  };
}

function extractCourt(notes: string | null) {
  if (!notes) return "";
  const match = notes.match(/Court\s*\d+/i);
  return match ? match[0] : "";
}

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

  let query = client
    .from("matches")
    .select(
      `
      week_number,
      scheduled_datetime,
      status,
      notes,
      home_team_id,
      away_team_id,
      home_team:teams!matches_home_team_id_fkey(id, name),
      away_team:teams!matches_away_team_id_fkey(id, name)
    `
    )
    .eq("season_id", params.id);

  if (teamId) {
    query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
  }

  const { data: matches, error: matchError } = await query.order("scheduled_datetime", {
    ascending: true
  });

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const rows: ScheduleRow[] = (matches || []).map((match) => {
    const { dateText, timeText } = formatDateTime(match.scheduled_datetime);
    return {
      week: match.week_number,
      dateText,
      timeText,
      courtText: extractCourt(match.notes),
      homeTeam: formatMatchTeamName(match.home_team, "Home"),
      awayTeam: formatMatchTeamName(match.away_team, "Away"),
      status: match.status || ""
    };
  });

  let pdfBytes: Uint8Array;
  let filename = "full_league_schedule.pdf";
  if (teamId) {
    const { data: team } = await client.from("teams").select("name").eq("id", teamId).maybeSingle();
    const teamName = team?.name || "Team";
    pdfBytes = buildTeamSchedulePdf(season.name, teamName, toTeamScheduleRows(teamName, rows));
    filename = `${teamName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_schedule.pdf`;
  } else {
    pdfBytes = buildFullLeagueSchedulePdf(season.name, rows);
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  });
}
