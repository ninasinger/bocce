import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { hashCode, getSession } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const client = getServiceClient();
    const { data, error } = await client
      .from("seasons")
      .select("id, name, year, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const unique = new Map<string, { id: string; name: string; year: number; created_at: string }>();
    for (const season of data || []) {
      const key = `${season.name}::${season.year}`;
      if (!unique.has(key)) {
        unique.set(key, season);
      }
    }

    const seasons = Array.from(unique.values())
      .sort((a, b) => b.year - a.year || b.created_at.localeCompare(a.created_at))
      .map(({ id, name, year }) => ({ id, name, year }));

    return NextResponse.json({ seasons });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load seasons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const bootstrap = request.headers.get("x-bootstrap-key");
  if (!session && bootstrap !== env.bootstrapKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  const commissionerCodeHash = await hashCode(String(body.commissioner_code));

  const client = getServiceClient();
  const { data, error } = await client
    .from("seasons")
    .insert({
      name: body.name,
      year: body.year,
      start_date: body.start_date,
      end_date: body.end_date,
      timezone: body.timezone,
      commissioner_code_hash: commissionerCodeHash,
      commissioner_email: body.commissioner_email,
      game_target_points: 16,
      games_per_match: 2
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ season: data });
}
