import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { loadSeasonStandings } from "@/lib/seasonStandings";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");
  const requestedWeek = week ? Number(week) : null;
  const weekNumber = requestedWeek && !Number.isNaN(requestedWeek) ? requestedWeek : null;

  const { data, error } = await loadSeasonStandings(client, params.id, weekNumber);
  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to load standings" }, { status: 500 });
  }

  return NextResponse.json(
    { standings: data.standings, week: weekNumber },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
