import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { formatMatchTeamName } from "@/lib/matchFormat";

export const runtime = "nodejs";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsUtc(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json(
      { error: "Google Calendar export is only available for a single team." },
      { status: 400 }
    );
  }

  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("name")
    .eq("id", params.id)
    .single();
  if (seasonError || !season) {
    return NextResponse.json({ error: seasonError?.message || "Season not found" }, { status: 500 });
  }

  const { data: team, error: teamError } = await client
    .from("teams")
    .select("name")
    .eq("id", teamId)
    .maybeSingle();
  if (teamError || !team) {
    return NextResponse.json({ error: teamError?.message || "Team not found" }, { status: 404 });
  }

  const { data: matches, error: matchError } = await client
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
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .not("scheduled_datetime", "is", null)
    .order("scheduled_datetime", { ascending: true });

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const dtStamp = toIcsUtc(new Date());
  const events = (matches || [])
    .map((match) => {
      const start = new Date(match.scheduled_datetime as string);
      if (Number.isNaN(start.getTime())) return "";
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const home = formatMatchTeamName(match.home_team, "Home");
      const away = formatMatchTeamName(match.away_team, "Away");
      const summary = escapeIcsText(`Week ${match.week_number}: ${home} vs ${away}`);
      const description = escapeIcsText(
        `Bocce League 2026\nWeek ${match.week_number}\n${home} vs ${away}${match.notes ? `\n${match.notes}` : ""}`
      );

      return [
        "BEGIN:VEVENT",
        `UID:${match.id}@bellavillabocce.com`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${toIcsUtc(start)}`,
        `DTEND:${toIcsUtc(end)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT"
      ].join("\r\n");
    })
    .filter(Boolean);

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BellaVilla Bocce//League Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(`${team.name} - ${season.name}`)}`,
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");

  const filename = `${team.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_schedule.ics`;
  return new NextResponse(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  });
}
