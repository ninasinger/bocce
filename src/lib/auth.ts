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
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getSecret() {
  if (!env.appSecret) {
    throw new Error("Missing APP_SECRET env var");
  }
  return new TextEncoder().encode(env.appSecret);
}

async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function refreshSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
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
