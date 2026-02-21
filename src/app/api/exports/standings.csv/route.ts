import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";
import { computeStandings } from "@/lib/standings";
import { toCsv } from "@/lib/csv";

export async function POST() {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const client = getServiceClient();

  const { data: teams } = await client
    .from("teams")
    .select("id, name")
    .eq("season_id", session.seasonId);

  const { data: matches } = await client
    .from("matches")
    .select("*")
    .eq("season_id", session.seasonId);

  const standings = computeStandings(teams || [], matches || []);

  const csv = toCsv(
    ["rank", "team", "games_played", "games_won", "match_points", "total_points"],
    standings.map((row) => [
      row.rank,
      row.teamName,
      row.gamesPlayed,
      row.gamesWon,
      row.matchPoints,
      row.totalPoints
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=standings.csv"
    }
  });
}
