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

const COLORS = {
  ink: "#1a1b1e",
  moss: "#2f5d50",
  mossLight: "#c9dcd2",
  stone: "#625e55",
  clay: "#d9a26f",
  border: "#e5ded3",
  white: "#ffffff",
  winner: "#2f5d50"
} as const;

const BANNER_HEIGHT = 58;
const PAGE_MARGIN_X = 42;
const BOTTOM_RESERVED = 18;

function formatTime(iso: string | null) {
  if (!iso) return "TBD";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleString("en-US", {
    weekday: "short",
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

function safeFilenameSegment(raw: string) {
  return raw
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.-]/g, "")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

function drawBanner(doc: PDFKit.PDFDocument, seasonName: string, subtitle: string) {
  doc.save();
  doc.rect(0, 0, doc.page.width, BANNER_HEIGHT).fill(COLORS.moss);
  doc.rect(0, BANNER_HEIGHT, doc.page.width, 3).fill(COLORS.clay);

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(seasonName, PAGE_MARGIN_X, 14, {
      width: doc.page.width - PAGE_MARGIN_X * 2,
      lineBreak: false,
      ellipsis: true
    });

  doc
    .fillColor(COLORS.mossLight)
    .font("Helvetica")
    .fontSize(10)
    .text(subtitle, PAGE_MARGIN_X, 36, {
      width: doc.page.width - PAGE_MARGIN_X * 2,
      lineBreak: false,
      ellipsis: true
    });

  doc.restore();
}

function drawFooter(doc: PDFKit.PDFDocument, pageIndex: number, totalPages: number, generatedLabel: string) {
  const y = doc.page.height - 12;
  const prevBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.save();
  doc.fillColor(COLORS.stone).font("Helvetica").fontSize(7.5);
  doc.text(generatedLabel, PAGE_MARGIN_X, y, {
    width: doc.page.width - PAGE_MARGIN_X * 2,
    lineBreak: false
  });
  doc.text(`Page ${pageIndex + 1} of ${totalPages}`, PAGE_MARGIN_X, y, {
    width: doc.page.width - PAGE_MARGIN_X * 2,
    align: "right",
    lineBreak: false
  });
  doc.restore();
  doc.page.margins.bottom = prevBottom;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottomLimit = doc.page.height - BOTTOM_RESERVED;
  if (doc.y + needed > bottomLimit) {
    doc.addPage();
  }
}

function buildPdf(
  seasonName: string,
  teamName: string | null,
  matches: MatchRow[]
): Promise<Buffer> {
  const subtitle = teamName ? `Team schedule — ${teamName}` : "Full league schedule";
  const generatedLabel = `Generated ${new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })}`;

  const doc = new PDFDocument({
    size: "LETTER",
    bufferPages: true,
    margins: {
      top: BANNER_HEIGHT + 14,
      bottom: BOTTOM_RESERVED,
      left: PAGE_MARGIN_X,
      right: PAGE_MARGIN_X
    }
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const endPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.on("pageAdded", () => {
    drawBanner(doc, seasonName, subtitle);
    doc.x = PAGE_MARGIN_X;
    doc.y = BANNER_HEIGHT + 14;
  });

  drawBanner(doc, seasonName, subtitle);
  doc.x = PAGE_MARGIN_X;
  doc.y = BANNER_HEIGHT + 14;

  if (matches.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.stone).text("No matches scheduled.");
  } else {
    const byWeek = new Map<number, MatchRow[]>();
    for (const match of matches) {
      const list = byWeek.get(match.week_number) || [];
      list.push(match);
      byWeek.set(match.week_number, list);
    }
    const weeks = Array.from(byWeek.keys()).sort((a, b) => a - b);
    const contentW = doc.page.width - PAGE_MARGIN_X * 2;

    for (const week of weeks) {
      ensureSpace(doc, 28);

      const weekY = doc.y;
      doc
        .fillColor(COLORS.ink)
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .text(`Week ${week}`, PAGE_MARGIN_X, weekY, { lineBreak: false, width: contentW });
      doc
        .strokeColor(COLORS.clay)
        .lineWidth(1.2)
        .moveTo(PAGE_MARGIN_X, weekY + 13)
        .lineTo(PAGE_MARGIN_X + 28, weekY + 13)
        .stroke();
      doc.y = weekY + 17;

      const weekMatches = (byWeek.get(week) || []).slice().sort((a, b) => {
        const ta = a.scheduled_datetime ? new Date(a.scheduled_datetime).getTime() : 0;
        const tb = b.scheduled_datetime ? new Date(b.scheduled_datetime).getTime() : 0;
        return ta - tb;
      });

      for (const match of weekMatches) {
        const home = formatMatchTeamName(match.home_team);
        const away = formatMatchTeamName(match.away_team);
        const when = formatTime(match.scheduled_datetime);
        const court = courtFromNotes(match.notes);
        const hasFinal =
          (match.status === "verified" || match.status === "corrected") &&
          match.home_total_score != null &&
          match.away_total_score != null;
        const extraNote = stripExtraTag(match.notes);
        const hasNote = Boolean(extraNote && !court);

        const rowHeight = 13 + (hasFinal ? 10 : 0) + (hasNote ? 10 : 0);
        ensureSpace(doc, rowHeight + 2);

        const rowY = doc.y;

        doc.save();
        doc.rect(PAGE_MARGIN_X, rowY + 2, 2, 9).fill(COLORS.moss);
        doc.restore();

        const textX = PAGE_MARGIN_X + 8;
        const timeW = 165;
        const timeLabel = court ? `${when}  ·  ${court}` : when;
        doc
          .fillColor(COLORS.stone)
          .font("Helvetica")
          .fontSize(9)
          .text(timeLabel, textX, rowY, {
            width: timeW,
            lineBreak: false,
            ellipsis: true
          });

        const teamsX = textX + timeW + 6;
        const teamsW = contentW - (teamsX - PAGE_MARGIN_X);
        doc
          .fillColor(COLORS.ink)
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .text(`${home}  vs  ${away}`, teamsX, rowY, {
            width: teamsW,
            lineBreak: false,
            ellipsis: true
          });

        let extraY = rowY + 13;

        if (hasFinal) {
          const scoreParts = [`Final ${match.home_total_score}–${match.away_total_score}`];
          if (match.home_games_won != null && match.away_games_won != null) {
            scoreParts.push(`Games ${match.home_games_won}–${match.away_games_won}`);
          }
          let winner = "";
          if ((match.home_total_score ?? 0) > (match.away_total_score ?? 0)) winner = home;
          else if ((match.away_total_score ?? 0) > (match.home_total_score ?? 0)) winner = away;
          if (winner) scoreParts.push(`Winner ${winner}`);
          else scoreParts.push("Tie");

          doc
            .fillColor(COLORS.winner)
            .font("Helvetica-Bold")
            .fontSize(8)
            .text(scoreParts.join("   ·   "), teamsX, extraY, {
              width: teamsW,
              lineBreak: false,
              ellipsis: true
            });
          extraY += 10;
        }

        if (hasNote) {
          doc
            .fillColor(COLORS.stone)
            .font("Helvetica-Oblique")
            .fontSize(8)
            .text(extraNote, teamsX, extraY, {
              width: teamsW,
              lineBreak: false,
              ellipsis: true
            });
          extraY += 10;
        }

        doc.y = rowY + rowHeight;
      }

      doc.y += 4;
    }
  }

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    drawFooter(doc, i, range.count, generatedLabel);
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

  const filename = teamName
    ? `${safeFilenameSegment(teamName) || "team"}_schedule.pdf`
    : "full_league_schedule.pdf";

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
