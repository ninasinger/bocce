import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getServiceClient } from "@/lib/supabaseServer";
import { formatMatchTeamName, type TeamRef } from "@/lib/matchFormat";

export const runtime = "nodejs";

type MatchRow = {
  week_number: number;
  scheduled_datetime: string | null;
  status: string;
  notes: string | null;
  home_games_won: number | null;
  away_games_won: number | null;
  home_total_score: number | null;
  away_total_score: number | null;
  home_match_points: number | null;
  away_match_points: number | null;
  home_team: TeamRef;
  away_team: TeamRef;
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  awaiting_submission: "Awaiting scores",
  pending_verification: "Pending other score",
  verified: "Verified",
  disputed: "Disputed",
  corrected: "Corrected"
};

function formatTime(iso: string | null) {
  if (!iso) return "TBD";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function dayOf(iso: string | null): "Tuesday" | "Thursday" | "Other" {
  if (!iso) return "Other";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Other";
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  if (day === "Tuesday" || day === "Thursday") return day;
  return "Other";
}

function courtFromNotes(notes: string | null) {
  if (!notes) return "";
  const match = notes.match(/Court\s*\d+/i);
  return match ? match[0] : "";
}

function stripExtraTag(notes: string | null) {
  if (!notes) return "";
  return notes.replace(/\s*-\s*EXTRA\b/gi, "").trim();
}

function buildPdf(
  seasonName: string,
  teamName: string | null,
  matches: MatchRow[]
): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const endPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fillColor("#2c2a24").font("Helvetica-Bold").fontSize(20).text(seasonName, { align: "left" });
  doc
    .moveDown(0.2)
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#4a4640")
    .text(teamName ? `Team schedule — ${teamName}` : "Full league schedule");
  doc
    .moveDown(0.2)
    .fontSize(9)
    .fillColor("#7a7368")
    .text(
      `Generated ${new Date().toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })}`
    );

  doc.moveDown(0.8);
  doc
    .strokeColor("#d4cfc4")
    .lineWidth(1)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.moveDown(0.6);

  if (matches.length === 0) {
    doc.fontSize(12).fillColor("#4a4640").text("No matches scheduled.");
    doc.end();
    return endPromise;
  }

  const byWeek = new Map<number, MatchRow[]>();
  for (const match of matches) {
    const list = byWeek.get(match.week_number) || [];
    list.push(match);
    byWeek.set(match.week_number, list);
  }
  const weeks = Array.from(byWeek.keys()).sort((a, b) => a - b);

  for (const week of weeks) {
    const weekMatches = byWeek.get(week) || [];

    if (doc.y > doc.page.height - doc.page.margins.bottom - 120) {
      doc.addPage();
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#2c2a24")
      .text(`Week ${week}`, { continued: false });
    doc.moveDown(0.3);

    const dayGroups: Record<"Tuesday" | "Thursday" | "Other", MatchRow[]> = {
      Tuesday: [],
      Thursday: [],
      Other: []
    };
    for (const match of weekMatches) {
      dayGroups[dayOf(match.scheduled_datetime)].push(match);
    }

    const dayOrder: Array<"Tuesday" | "Thursday" | "Other"> = ["Tuesday", "Thursday", "Other"];
    for (const day of dayOrder) {
      const list = dayGroups[day];
      if (list.length === 0) continue;

      if (doc.y > doc.page.height - doc.page.margins.bottom - 80) {
        doc.addPage();
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#625e55")
        .text(day.toUpperCase(), { characterSpacing: 1 });
      doc.moveDown(0.2);

      for (const match of list) {
        if (doc.y > doc.page.height - doc.page.margins.bottom - 60) {
          doc.addPage();
        }

        const home = formatMatchTeamName(match.home_team);
        const away = formatMatchTeamName(match.away_team);
        const when = formatTime(match.scheduled_datetime);
        const court = courtFromNotes(match.notes);
        const status = STATUS_LABELS[match.status] || match.status;

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#2c2a24")
          .text(`${home} vs ${away}`, { continued: false });

        const metaParts = [when];
        if (court) metaParts.push(court);
        metaParts.push(status);

        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#625e55")
          .text(metaParts.join("  ·  "));

        if (
          (match.status === "verified" || match.status === "corrected") &&
          match.home_total_score != null &&
          match.away_total_score != null
        ) {
          const scoreLine =
            match.home_games_won != null && match.away_games_won != null
              ? `Final: ${match.home_total_score}-${match.away_total_score}   Games: ${match.home_games_won}-${match.away_games_won}`
              : `Final: ${match.home_total_score}-${match.away_total_score}`;
          let winner = "";
          if (match.home_total_score > match.away_total_score) winner = `Winner: ${home}`;
          else if (match.away_total_score > match.home_total_score) winner = `Winner: ${away}`;
          else winner = "Winner: Tie";

          doc.font("Helvetica").fontSize(9).fillColor("#2c2a24").text(scoreLine);
          doc.font("Helvetica-Bold").fontSize(9).fillColor("#3f5c3f").text(winner);
        }

        const extraNote = stripExtraTag(match.notes);
        if (extraNote && !court) {
          doc.font("Helvetica-Oblique").fontSize(9).fillColor("#7a7368").text(extraNote);
        }

        doc.moveDown(0.4);
      }

      doc.moveDown(0.2);
    }

    doc.moveDown(0.4);
  }

  doc.end();
  return endPromise;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const client = getServiceClient();
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("name")
    .eq("id", params.id)
    .single();

  if (seasonError) {
    return NextResponse.json({ error: seasonError.message }, { status: 500 });
  }

  let teamName: string | null = null;
  if (teamId) {
    const { data: team } = await client.from("teams").select("name").eq("id", teamId).maybeSingle();
    teamName = team?.name ? formatMatchTeamName({ name: team.name }) : null;
  }

  let query = client
    .from("matches")
    .select(
      `
      week_number,
      scheduled_datetime,
      status,
      notes,
      home_games_won,
      away_games_won,
      home_total_score,
      away_total_score,
      home_match_points,
      away_match_points,
      home_team:teams!matches_home_team_id_fkey(id, name),
      away_team:teams!matches_away_team_id_fkey(id, name)
    `
    )
    .eq("season_id", params.id);

  if (teamId) {
    query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
  }

  const { data: matches, error: matchesError } = await query.order("scheduled_datetime", {
    ascending: true
  });

  if (matchesError) {
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }

  const pdf = await buildPdf(season.name, teamName, (matches || []) as MatchRow[]);

  const safeSeasonName = (season.name || "season")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const filename = teamId ? `${safeSeasonName}-team-schedule.pdf` : `${safeSeasonName}-schedule.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  });
}
