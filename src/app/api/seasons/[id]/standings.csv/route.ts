import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { loadStandingsExport } from "@/lib/seasonStandings";
import { toRankingCsv } from "@/lib/rankingExport";
import { standingsFilename } from "@/lib/standingsPdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data, error, status } = await loadStandingsExport(getServiceClient(), params.id);
  if (error || !data) {
    return NextResponse.json({ error }, { status });
  }

  return new NextResponse(toRankingCsv(data.standings), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${standingsFilename(data.seasonName, "csv")}`,
      "Cache-Control": "no-store"
    }
  });
}
