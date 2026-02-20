import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createGoogleStateToken, getGoogleRedirectUri } from "@/lib/googleOAuth";

export async function GET(request: Request) {
  if (!env.googleOAuthClientId || !env.googleOAuthClientSecret) {
    return NextResponse.json(
      { error: "Missing Google OAuth client env vars" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const mode = (url.searchParams.get("mode") || "login") as "login" | "drive";
  const seasonId = url.searchParams.get("seasonId") || undefined;

  if (!seasonId) {
    return NextResponse.json({ error: "Missing seasonId" }, { status: 400 });
  }

  const state = await createGoogleStateToken({ mode, seasonId });
  const redirectUri = getGoogleRedirectUri();
  const scopes =
    mode === "drive"
      ? [
          "openid",
          "email",
          "profile",
          "https://www.googleapis.com/auth/drive.file"
        ]
      : ["openid", "email", "profile"];

  const params = new URLSearchParams({
    client_id: env.googleOAuthClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    include_granted_scopes: "true",
    state,
    access_type: mode === "drive" ? "offline" : "online",
    prompt: mode === "drive" ? "consent" : "select_account"
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
