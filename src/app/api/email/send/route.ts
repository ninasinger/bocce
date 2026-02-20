import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireRoleOrResponse } from "@/lib/api";
import { computeStandings } from "@/lib/standings";
import { buildWeeklyEmail } from "@/lib/email";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const session = await requireRoleOrResponse("commissioner");
  if (session instanceof Response) return session;
  const { weekNumber } = await request.json();

  const client = getServiceClient();
  const { data: season } = await client
    .from("seasons")
    .select("commissioner_email")
    .eq("id", session.seasonId)
    .maybeSingle();

  if (!season?.commissioner_email) {
    return NextResponse.json({ error: "Missing commissioner email" }, { status: 400 });
  }

  const { data: teams } = await client
    .from("teams")
    .select("id, name")
    .eq("season_id", session.seasonId);

  const { data: matches } = await client
    .from("matches")
    .select("*")
    .eq("season_id", session.seasonId)
    .eq("week_number", Number(weekNumber));

  const { data: week } = await client
    .from("weeks")
    .select("closed_at")
    .eq("season_id", session.seasonId)
    .eq("week_number", Number(weekNumber))
    .maybeSingle();

  const standings = computeStandings(teams || [], matches || []);
  const email = buildWeeklyEmail({
    weekNumber: Number(weekNumber),
    standings,
    verifiedMatches: (matches || []).filter((m) => m.status === "verified"),
    pendingMatches: (matches || []).filter((m) => m.status === "pending_verification"),
    disputedMatches: (matches || []).filter((m) => m.status === "disputed"),
    weekClosed: Boolean(week?.closed_at)
  });

  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: "Bocce League <league@resend.dev>",
    to: season.commissioner_email,
    subject: email.subject,
    html: email.html
  });

  return NextResponse.json({ status: "sent" });
}
