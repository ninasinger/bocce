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
  field: "#f4efe9",
  fieldLight: "#fbf8f3",
  clay: "#d9a26f",
  border: "#e5ded3",
  white: "#ffffff",
  winner: "#2f5d50",
  danger: "#b84545"
} as const;

const STATUS_STYLES: Record<string, { label: string; bg: string; fg: string }> = {
  scheduled: { label: "Scheduled", bg: "#e6e2db", fg: "#3d3a34" },
  awaiting_submission: { label: "Awaiting scores", bg: "#f6e3c5", fg: "#7a5623" },
  pending_verification: { label: "Pending other score", bg: "#fce9a8", fg: "#6d5612" },
  verified: { label: "Verified", bg: "#d7e7df", fg: "#214a3f" },
  disputed: { label: "Disputed", bg: "#f5d3d3", fg: "#7d2a2a" },
  corrected: { label: "Corrected", bg: "#d5e4ef", fg: "#274a63" }
};

const BANNER_HEIGHT = 88;
const PAGE_MARGIN_X = 48;

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
  doc.rect(0, BANNER_HEIGHT, doc.page.width, 4).fill(COLORS.clay);

  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(seasonName, PAGE_MARGIN_X, 22, {
      width: doc.page.width - PAGE_MARGIN_X * 2,
      lineBreak: false,
      ellipsis: true
    });

  doc
    .fillColor(COLORS.mossLight)
    .font("Helvetica")
    .fontSize(12)
    .text(subtitle, PAGE_MARGIN_X, 52, {
      width: doc.page.width - PAGE_MARGIN_X * 2,
      lineBreak: false,
      ellipsis: true
    });

  doc.restore();
}

function drawFooter(doc: PDFKit.PDFDocument, pageIndex: number, generatedLabel: string) {
  const y = doc.page.height - 28;
  doc.save();
  doc
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .moveTo(PAGE_MARGIN_X, y - 10)
    .lineTo(doc.page.width - PAGE_MARGIN_X, y - 10)
    .stroke();
  doc.fillColor(COLORS.stone).font("Helvetica").fontSize(8);
  doc.text(generatedLabel, PAGE_MARGIN_X, y, {
    width: doc.page.width - PAGE_MARGIN_X * 2,
    lineBreak: false
  });
  doc.text(`Page ${pageIndex + 1}`, PAGE_MARGIN_X, y, {
    width: doc.page.width - PAGE_MARGIN_X * 2,
    align: "right",
    lineBreak: false
  });
  doc.restore();
}

function drawPill(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  bg: string,
  fg: string
) {
  doc.save();
  doc.font("Helvetica-Bold").fontSize(8);
  const paddingX = 7;
  const paddingY = 3;
  const textWidth = doc.widthOfString(text);
  const textHeight = doc.currentLineHeight();
  const w = textWidth + paddingX * 2;
  const h = textHeight + paddingY * 2;
  doc.roundedRect(x, y, w, h, h / 2).fill(bg);
  doc.fillColor(fg).text(text, x + paddingX, y + paddingY, { lineBreak: false });
  doc.restore();
  return { w, h };
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottomLimit = doc.page.height - 56;
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
    weekday: "short",
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
      top: BANNER_HEIGHT + 24,
      bottom: 48,
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
    doc.y = BANNER_HEIGHT + 24;
  });

  drawBanner(doc, seasonName, subtitle);
  doc.x = PAGE_MARGIN_X;
  doc.y = BANNER_HEIGHT + 24;

  doc
    .fillColor(COLORS.stone)
    .font("Helvetica")
    .fontSize(9)
    .text(generatedLabel, PAGE_MARGIN_X, doc.y, { lineBreak: false });
  doc.moveDown(1.2);

  if (matches.length === 0) {
    doc.font("Helvetica").fontSize(12).fillColor(COLORS.stone).text("No matches scheduled.");
  } else {
    const byWeek = new Map<number, MatchRow[]>();
    for (const match of matches) {
      const list = byWeek.get(match.week_number) || [];
      list.push(match);
      byWeek.set(match.week_number, list);
    }
    const weeks = Array.from(byWeek.keys()).sort((a, b) => a - b);

    for (const week of weeks) {
      ensureSpace(doc, 80);

      doc
        .fillColor(COLORS.ink)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(`Week ${week}`, PAGE_MARGIN_X, doc.y, { lineBreak: false });

      const underlineY = doc.y + 22;
      doc
        .strokeColor(COLORS.clay)
        .lineWidth(2)
        .moveTo(PAGE_MARGIN_X, underlineY)
        .lineTo(PAGE_MARGIN_X + 46, underlineY)
        .stroke();

      doc.y = underlineY + 10;

      const dayGroups: Record<"Tuesday" | "Thursday" | "Other", MatchRow[]> = {
        Tuesday: [],
        Thursday: [],
        Other: []
      };
      const weekMatches = byWeek.get(week) || [];
      for (const match of weekMatches) {
        dayGroups[dayOf(match.scheduled_datetime)].push(match);
      }

      const dayOrder: Array<"Tuesday" | "Thursday" | "Other"> = ["Tuesday", "Thursday", "Other"];
      for (const day of dayOrder) {
        const list = dayGroups[day];
        if (list.length === 0) continue;

        ensureSpace(doc, 40);

        doc
          .fillColor(COLORS.stone)
          .font("Helvetica-Bold")
          .fontSize(9)
          .text(day.toUpperCase(), PAGE_MARGIN_X, doc.y, {
            characterSpacing: 1.2,
            lineBreak: false
          });
        doc.y += 16;

        for (const match of list) {
          const home = formatMatchTeamName(match.home_team);
          const away = formatMatchTeamName(match.away_team);
          const when = formatTime(match.scheduled_datetime);
          const court = courtFromNotes(match.notes);
          const statusStyle = STATUS_STYLES[match.status] || {
            label: match.status,
            bg: "#eeeae3",
            fg: COLORS.stone
          };
          const hasFinal =
            (match.status === "verified" || match.status === "corrected") &&
            match.home_total_score != null &&
            match.away_total_score != null;
          const extraNote = stripExtraTag(match.notes);
          const hasNote = Boolean(extraNote && !court);

          let cardHeight = 52;
          if (hasFinal) cardHeight += 30;
          if (hasNote) cardHeight += 14;

          ensureSpace(doc, cardHeight + 8);

          const cardX = PAGE_MARGIN_X;
          const cardY = doc.y;
          const cardW = doc.page.width - PAGE_MARGIN_X * 2;

          doc
            .roundedRect(cardX, cardY, cardW, cardHeight, 8)
            .fillAndStroke(COLORS.fieldLight, COLORS.border);

          // Left accent bar
          doc.save();
          doc.rect(cardX, cardY, 4, cardHeight).fill(COLORS.moss);
          doc.restore();

          const contentX = cardX + 16;
          const contentW = cardW - 32;

          doc
            .fillColor(COLORS.ink)
            .font("Helvetica-Bold")
            .fontSize(12)
            .text(`${home}  vs  ${away}`, contentX, cardY + 12, {
              width: contentW - 130,
              lineBreak: false,
              ellipsis: true
            });

          const metaParts = [when];
          if (court) metaParts.push(court);
          doc
            .fillColor(COLORS.stone)
            .font("Helvetica")
            .fontSize(9)
            .text(metaParts.join("   •   "), contentX, cardY + 30, {
              width: contentW - 130,
              lineBreak: false,
              ellipsis: true
            });

          // Status pill, top-right
          doc.font("Helvetica-Bold").fontSize(8);
          const pillText = statusStyle.label;
          const pillTextWidth = doc.widthOfString(pillText);
          const pillW = pillTextWidth + 14;
          const pillX = cardX + cardW - 14 - pillW;
          drawPill(doc, pillText, pillX, cardY + 12, statusStyle.bg, statusStyle.fg);

          let bottomY = cardY + 48;

          if (hasFinal) {
            const scoreLine =
              match.home_games_won != null && match.away_games_won != null
                ? `Final  ${match.home_total_score}–${match.away_total_score}    Games  ${match.home_games_won}–${match.away_games_won}`
                : `Final  ${match.home_total_score}–${match.away_total_score}`;
            let winner = "";
            if ((match.home_total_score ?? 0) > (match.away_total_score ?? 0))
              winner = `Winner · ${home}`;
            else if ((match.away_total_score ?? 0) > (match.home_total_score ?? 0))
              winner = `Winner · ${away}`;
            else winner = "Result · Tie";

            doc
              .fillColor(COLORS.ink)
              .font("Helvetica-Bold")
              .fontSize(10)
              .text(scoreLine, contentX, bottomY, {
                width: contentW,
                lineBreak: false,
                ellipsis: true
              });
            doc
              .fillColor(COLORS.winner)
              .font("Helvetica-Bold")
              .fontSize(9)
              .text(winner, contentX, bottomY + 14, {
                width: contentW,
                lineBreak: false,
                ellipsis: true
              });
            bottomY += 30;
          }

          if (hasNote) {
            doc
              .fillColor(COLORS.stone)
              .font("Helvetica-Oblique")
              .fontSize(9)
              .text(extraNote, contentX, bottomY, {
                width: contentW,
                lineBreak: false,
                ellipsis: true
              });
          }

          doc.y = cardY + cardHeight + 8;
        }

        doc.y += 4;
      }

      doc.y += 10;
    }
  }

  // Draw footer on every buffered page
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    drawFooter(doc, i, generatedLabel);
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
