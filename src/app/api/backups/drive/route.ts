import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";
import { computeStandings } from "@/lib/standings";
import { toCsv } from "@/lib/csv";
import { toRankingCsv } from "@/lib/rankingExport";
import { env } from "@/lib/env";

function getDriveClientWithOAuth(refreshToken: string) {
  if (!env.googleOAuthClientId || !env.googleOAuthClientSecret) {
    throw new Error("Missing Google OAuth client env vars");
  }
  const oauth2 = new google.auth.OAuth2(
    env.googleOAuthClientId,
    env.googleOAuthClientSecret,
    env.googleOAuthRedirectUri || `${env.appUrl}/api/auth/google/callback`
  );
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth: oauth2 });
}

async function uploadTextFile(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string,
  contentType: string,
  body: string
) {
  await drive.files.create({
    requestBody: {
      name,
      parents: [parentId]
    },
    media: {
      mimeType: contentType,
      body: Readable.from(body)
    }
  });
}

export async function POST(request: Request) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const { weekNumber } = await request.json();

  if (!env.driveFolderId) {
    return NextResponse.json({ error: "Missing Drive folder id" }, { status: 400 });
  }

  const client = getServiceClient();
  const { data: season } = await client
    .from("seasons")
    .select("*")
    .eq("id", session.seasonId)
    .maybeSingle();

  const { data: teams } = await client
    .from("teams")
    .select("id, name")
    .eq("season_id", session.seasonId);

  const { data: matches } = await client
    .from("matches")
    .select("*")
    .eq("season_id", session.seasonId);

  const standings = computeStandings(teams || [], matches || []);

  const seasonJson = JSON.stringify(
    { season, teams, matches, standings },
    null,
    2
  );

  const matchesCsv = toCsv(
    [
      "id",
      "week_number",
      "scheduled_datetime",
      "home_team_id",
      "away_team_id",
      "status",
      "home_games_won",
      "away_games_won",
      "home_total_score",
      "away_total_score",
      "home_match_points",
      "away_match_points",
      "notes"
    ],
    (matches || []).map((m) => [
      m.id,
      m.week_number,
      m.scheduled_datetime,
      m.home_team_id,
      m.away_team_id,
      m.status,
      m.home_games_won,
      m.away_games_won,
      m.home_total_score,
      m.away_total_score,
      m.home_match_points,
      m.away_match_points,
      m.notes
    ])
  );

  const standingsCsv = toRankingCsv(standings);

  const { data: integration } = await client
    .from("commissioner_integrations")
    .select("refresh_token")
    .eq("season_id", session.seasonId)
    .eq("provider", "google_drive")
    .maybeSingle();

  if (!integration?.refresh_token) {
    return NextResponse.json(
      {
        error: "Google Drive is not connected. Connect Drive in Commissioner settings to back up to your Google Drive."
      },
      { status: 400 }
    );
  }

  const drive = getDriveClientWithOAuth(integration.refresh_token);
  const folderName = `season-${season?.year ?? "unknown"}/week-${weekNumber}`;

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [env.driveFolderId]
    }
  });

  const folderId = folder.data.id;
  if (!folderId) {
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }

  await uploadTextFile(drive, "season.json", folderId, "application/json", seasonJson);
  await uploadTextFile(drive, "matches.csv", folderId, "text/csv", matchesCsv);
  await uploadTextFile(
    drive,
    "standings.csv",
    folderId,
    "text/csv",
    standingsCsv
  );

  return NextResponse.json({ status: "uploaded" });
}
