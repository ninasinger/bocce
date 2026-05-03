import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { loadSeasonSummary, loadSeasonsList } from "@/lib/seasonSummary";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = getServiceClient();

  const { seasons, error: seasonsError } = await loadSeasonsList(client);
  if (seasonsError || !seasons) {
    return NextResponse.json({ error: seasonsError || "Failed to load seasons" }, { status: 500 });
  }

  const defaultSeasonId = seasons[0]?.id || null;
  if (!defaultSeasonId) {
    return NextResponse.json(
      { seasons, defaultSeasonId: null, summary: null },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const { data: summary, error: summaryError } = await loadSeasonSummary(client, defaultSeasonId);
  if (summaryError || !summary) {
    return NextResponse.json({ error: summaryError || "Failed to load summary" }, { status: 500 });
  }

  return NextResponse.json(
    { seasons, defaultSeasonId, summary },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
