import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { loadSeasonSummary } from "@/lib/seasonSummary";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const client = getServiceClient();
  const { data, error } = await loadSeasonSummary(client, params.id);
  if (error || !data) {
    return NextResponse.json({ error: error || "Failed to load summary" }, { status: 500 });
  }
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
