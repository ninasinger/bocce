import { NextResponse } from "next/server";
import { getSession, refreshSessionCookie } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await refreshSessionCookie(session);
  return NextResponse.json({ authenticated: true, session });
}
