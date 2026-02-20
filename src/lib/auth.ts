import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { env } from "./env";

export type SessionRole = "captain" | "commissioner";

export type SessionPayload = {
  role: SessionRole;
  teamId?: string;
  seasonId?: string;
};

const COOKIE_NAME = "bocce_session";

function getSecret() {
  if (!env.appSecret) {
    throw new Error("Missing APP_SECRET env var");
  }
  return new TextEncoder().encode(env.appSecret);
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireRole(role: SessionRole) {
  const session = await getSession();
  if (!session || session.role !== role) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function verifyCode(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}

export async function hashCode(code: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(code, salt);
}
