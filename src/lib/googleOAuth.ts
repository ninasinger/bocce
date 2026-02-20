import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

export type GoogleOAuthMode = "login" | "drive";

export type GoogleOAuthState = {
  mode: GoogleOAuthMode;
  seasonId?: string;
};

function getSecret() {
  if (!env.appSecret) {
    throw new Error("Missing APP_SECRET env var");
  }
  return new TextEncoder().encode(env.appSecret);
}

export function getGoogleRedirectUri() {
  return env.googleOAuthRedirectUri || `${env.appUrl}/api/auth/google/callback`;
}

export async function createGoogleStateToken(payload: GoogleOAuthState) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecret());
}

export async function verifyGoogleStateToken(state: string) {
  const { payload } = await jwtVerify(state, getSecret());
  return payload as GoogleOAuthState;
}
