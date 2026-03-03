import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";
import { computeStandings } from "@/lib/standings";
import { toRankingCsv } from "@/lib/rankingExport";

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

  const csv = toRankingCsv(standings);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=standings.csv"
    }
  });
}
