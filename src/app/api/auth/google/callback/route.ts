import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { createSessionCookie } from "@/lib/auth";
import { env } from "@/lib/env";
import { getGoogleRedirectUri, verifyGoogleStateToken } from "@/lib/googleOAuth";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type GoogleUser = {
  email?: string;
};

export async function GET(request: Request) {
  try {
    if (!env.googleOAuthClientId || !env.googleOAuthClientSecret) {
      return NextResponse.json(
        { error: "Missing Google OAuth client env vars" },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");

    if (!code || !stateParam) {
      return NextResponse.redirect(`${env.appUrl}/commissioner/login?error=missing_oauth_params`);
    }

    const state = await verifyGoogleStateToken(stateParam);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.googleOAuthClientId,
        client_secret: env.googleOAuthClientSecret,
        redirect_uri: getGoogleRedirectUri(),
        grant_type: "authorization_code"
      })
    });

    const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenJson.access_token) {
      return NextResponse.redirect(`${env.appUrl}/commissioner/login?error=oauth_exchange_failed`);
    }

    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    const user = (await userRes.json()) as GoogleUser;
    const email = (user.email || "").toLowerCase();
    if (!email) {
      return NextResponse.redirect(`${env.appUrl}/commissioner/login?error=no_email`);
    }

    const client = getServiceClient();
    const { data: season } = await client
      .from("seasons")
      .select("id, commissioner_email")
      .eq("id", state.seasonId)
      .maybeSingle();

    if (!season) {
      return NextResponse.redirect(`${env.appUrl}/commissioner/login?error=invalid_season`);
    }

    const existingEmail = (season.commissioner_email || "").toLowerCase();
    if (!existingEmail) {
      await client
        .from("seasons")
        .update({ commissioner_email: email })
        .eq("id", season.id);
    } else if (existingEmail !== email) {
      return NextResponse.redirect(`${env.appUrl}/commissioner/login?error=email_not_allowed`);
    }

    await createSessionCookie({ role: "commissioner", seasonId: season.id });

    if (state.mode === "drive") {
      const { data: existingIntegration } = await client
        .from("commissioner_integrations")
        .select("refresh_token")
        .eq("season_id", season.id)
        .eq("provider", "google_drive")
        .maybeSingle();

      const refreshTokenToStore =
        tokenJson.refresh_token || existingIntegration?.refresh_token || null;

      const { error: upsertError } = await client
        .from("commissioner_integrations")
        .upsert(
          {
            season_id: season.id,
            provider: "google_drive",
            commissioner_email: email,
            refresh_token: refreshTokenToStore,
            access_token: tokenJson.access_token,
            token_expiry: tokenJson.expires_in
              ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString()
              : null
          },
          { onConflict: "season_id,provider" }
        );

      if (upsertError) {
        return NextResponse.redirect(`${env.appUrl}/commissioner?google=drive_error`);
      }

      if (!refreshTokenToStore && !tokenJson.access_token) {
        return NextResponse.redirect(`${env.appUrl}/commissioner?google=drive_missing_token`);
      }
    }

    return NextResponse.redirect(`${env.appUrl}/commissioner?google=${state.mode}`);
  } catch {
    return NextResponse.redirect(`${env.appUrl}/commissioner/login?error=oauth_callback_failed`);
  }
}
