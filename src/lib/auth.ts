import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { env } from "./env";

export type SessionRole = "captain" | "commissioner";

export type SessionPayload = {
  role: SessionRole;
  teamId?: string;
  seasonId?: string;
  rememberMe?: boolean;
};

const COOKIE_NAME = "bocce_session";
const DEFAULT_SESSION_DAYS = 30;
const EXTENDED_SESSION_DAYS = 90;

function getSecret() {
  if (!env.appSecret) {
    throw new Error("Missing APP_SECRET env var");
  }
  return new TextEncoder().encode(env.appSecret);
}

function daysToSeconds(days: number) {
  return days * 24 * 60 * 60;
}

async function createSessionToken(payload: SessionPayload, maxAgeSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecret());
}

export async function createSessionCookie(payload: SessionPayload) {
  const maxAge = daysToSeconds(payload.rememberMe ? EXTENDED_SESSION_DAYS : DEFAULT_SESSION_DAYS);
  const token = await createSessionToken(payload, maxAge);

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
}

export async function refreshSessionCookie(payload: SessionPayload) {
  const maxAge = daysToSeconds(payload.rememberMe ? EXTENDED_SESSION_DAYS : DEFAULT_SESSION_DAYS);
  const token = await createSessionToken(payload, maxAge);

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    await clearSessionCookie();
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
