import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { computeStandings } from "@/lib/standings";
import { getCurrentWeek } from "@/lib/week";

function getPublishedStandingsWeek(currentWeek: number) {
  const etWeekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/New_York"
  }).format(new Date());
  const isFridayOrLater = etWeekday === "Fri" || etWeekday === "Sat" || etWeekday === "Sun";
  return isFridayOrLater ? currentWeek : Math.max(1, currentWeek - 1);
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
  const currentWeek = getCurrentWeek(allMatches);
  const weekNumber =
    requestedWeek && !Number.isNaN(requestedWeek)
      ? requestedWeek
      : getPublishedStandingsWeek(currentWeek);
  const scopedMatches =
    weekNumber
      ? allMatches.filter((match) => match.week_number <= weekNumber)
      : allMatches;

  const standings = computeStandings(teams || [], scopedMatches);

  // Compute previous week standings for rank movement
  const prevWeek = weekNumber && !Number.isNaN(weekNumber) ? weekNumber - 1 : null;
  let prevRankMap: Record<string, number> | null = null;

  if (prevWeek && prevWeek >= 1) {
    const prevMatches = allMatches.filter((match) => match.week_number <= prevWeek);
    const prevStandings = computeStandings(teams || [], prevMatches);
    // Only build the map if there were verified matches in the previous weeks
    if (prevStandings.some((s) => s.gamesPlayed > 0)) {
      prevRankMap = {};
      for (const s of prevStandings) {
        if (s.gamesPlayed > 0) {
          prevRankMap[s.teamName] = s.rank;
        }
      }
    }
  }

  const standingsWithMovement = standings.map((s) => ({
    ...s,
    prevRank: prevRankMap && prevRankMap[s.teamName] != null ? prevRankMap[s.teamName] : null,
  }));

  return NextResponse.json({ standings: standingsWithMovement, week: weekNumber, currentWeek });
}
