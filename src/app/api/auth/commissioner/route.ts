import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { createSessionCookie, verifyCode } from "@/lib/auth";

export async function POST(request: Request) {
  const { commissionerCode, seasonId } = await request.json();
  if (!commissionerCode || !seasonId) {
    return NextResponse.json({ error: "Missing commissioner code or season" }, { status: 400 });
  }

  const client = getServiceClient();
  const { data: season, error } = await client
    .from("seasons")
    .select("id, commissioner_code_hash")
    .eq("id", seasonId)
    .maybeSingle();

  if (error || !season) {
    return NextResponse.json({ error: "Invalid season" }, { status: 401 });
  }

  const valid = await verifyCode(String(commissionerCode), season.commissioner_code_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  await createSessionCookie({ role: "commissioner", seasonId: season.id });
  return NextResponse.json({ ok: true });
}
