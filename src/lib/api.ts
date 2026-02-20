import { NextResponse } from "next/server";
import { getSession, SessionRole } from "./auth";

export async function requireRoleOrResponse(role: SessionRole) {
  const session = await getSession();
  if (!session || session.role !== role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
