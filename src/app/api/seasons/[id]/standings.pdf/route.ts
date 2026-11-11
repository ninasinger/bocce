import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { loadStandingsExport } from "@/lib/seasonStandings";
import { buildStandingsPdf, standingsFilename } from "@/lib/standingsPdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data, error, status } = await loadStandingsExport(getServiceClient(), params.id);
  if (error || !data) {
    return NextResponse.json({ error }, { status });
  }

  const pdfBytes = buildStandingsPdf(data.seasonName, data.throughWeek, data.standings);
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${standingsFilename(data.seasonName, "pdf")}`,
      "Cache-Control": "no-store"
    }
  });
}
