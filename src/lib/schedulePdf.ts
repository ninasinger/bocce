import { buildPdf, PdfCanvas } from "@/lib/simplePdf";

export type ScheduleRow = {
  week: number;
  dateText: string;
  timeText: string;
  courtText: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
};

type TeamScheduleRow = {
  week: number;
  dateTimeText: string;
  matchupText: string;
  courtText: string;
};

function truncate(value: string, max = 26) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

const THEME = {
  pageBg: [0.97, 0.94, 0.9] as [number, number, number],
  cardBg: [0.99, 0.99, 0.985] as [number, number, number],
  cardBorder: [0.9, 0.88, 0.84] as [number, number, number],
  moss: [0.18, 0.36, 0.31] as [number, number, number],
  mossSoft: [0.79, 0.86, 0.82] as [number, number, number],
  clay: [0.85, 0.66, 0.44] as [number, number, number],
  ink: [0.11, 0.12, 0.13] as [number, number, number],
  stone: [0.39, 0.37, 0.34] as [number, number, number],
  mutedRow: [0.965, 0.975, 0.97] as [number, number, number]
};

function drawPageChrome(canvas: PdfCanvas) {
  canvas.rect(0, 0, 612, 792, {
    stroke: false,
    fill: true,
    fillColor: THEME.pageBg
  });
  canvas.rect(20, 20, 572, 752, {
    stroke: true,
    fill: true,
    fillColor: THEME.cardBg,
    strokeColor: THEME.cardBorder
  });
  canvas.rect(36, 36, 100, 20, {
    stroke: false,
    fill: true,
    fillColor: [0.93, 0.85, 0.64]
  });
  canvas.text(47, 50, "BOCCE LEAGUE", { size: 9, bold: true, color: THEME.ink });
}

function drawHeader(canvas: PdfCanvas, title: string, subtitle: string) {
  drawPageChrome(canvas);
  canvas.rect(36, 66, 540, 70, {
    stroke: true,
    fill: true,
    fillColor: [0.94, 0.96, 0.93],
    strokeColor: THEME.cardBorder
  });
  canvas.rect(36, 66, 540, 5, {
    stroke: false,
    fill: true,
    fillColor: THEME.clay
  });
  canvas.text(52, 96, title, { bold: true, size: 20, color: THEME.ink });
  canvas.text(52, 118, subtitle, { size: 10, color: THEME.stone });
}

function drawTableHeader(canvas: PdfCanvas, y: number, headers: string[], colX: number[]) {
  canvas.rect(36, y - 14, 540, 18, {
    stroke: false,
    fill: true,
    fillColor: THEME.mossSoft
  });
  headers.forEach((header, i) => {
    canvas.text(colX[i], y, header, { bold: true, size: 9, color: THEME.moss });
  });
}

export function buildFullLeagueSchedulePdf(seasonName: string, rows: ScheduleRow[]) {
  const pages: PdfCanvas[] = [];
  const rowsPerPage = 48;
  const colX = [42, 78, 176, 234, 396];
  const headers = ["WK", "DATE / TIME", "COURT", "HOME TEAM", "AWAY TEAM"];

  for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
    const start = pageIndex * rowsPerPage;
    const end = start + rowsPerPage;
    const pageRows = rows.slice(start, end);
    if (pageRows.length === 0) break;

    const canvas = new PdfCanvas();
    drawHeader(
      canvas,
      "Full League Schedule",
      `${seasonName} - ${rows.length} matches - Page ${pageIndex + 1}`
    );
    drawTableHeader(canvas, 164, headers, colX);

    pageRows.forEach((row, rowIndex) => {
      const y = 182 + rowIndex * 12;
      if (rowIndex % 2 === 1) {
        canvas.rect(36, y - 11, 540, 13, {
          stroke: false,
          fill: true,
          fillColor: THEME.mutedRow
        });
      }
      canvas.text(colX[0], y, String(row.week), { size: 8, color: THEME.stone });
      canvas.text(colX[1], y, `${row.dateText} ${row.timeText}`, { size: 8, color: THEME.stone });
      canvas.text(colX[2], y, row.courtText || "-", { size: 8, color: THEME.stone });
      canvas.text(colX[3], y, truncate(row.homeTeam, 22), { size: 8, bold: true, color: THEME.ink });
      canvas.text(colX[4], y, truncate(row.awayTeam, 22), { size: 8, bold: true, color: THEME.ink });
    });

    canvas.text(44, 748, "Generated from League Scoring Hub", {
      size: 8,
      color: THEME.stone
    });

    pages.push(canvas);
  }

  return buildPdf(pages.map((page) => page.toPage()));
}

export function buildTeamSchedulePdf(
  seasonName: string,
  teamName: string,
  rows: TeamScheduleRow[]
) {
  const canvas = new PdfCanvas();
  drawHeader(canvas, `${teamName} Schedule`, `${seasonName} - ${rows.length} matches`);

  canvas.rect(36, 152, 540, 576, {
    stroke: true,
    fill: true,
    fillColor: [0.985, 0.99, 0.985],
    strokeColor: THEME.cardBorder,
    lineWidth: 1
  });

  const colX = [48, 86, 226, 504];
  drawTableHeader(canvas, 176, ["WK", "DATE / TIME", "MATCHUP", "COURT"], colX);

  rows.slice(0, 24).forEach((row, idx) => {
    const y = 196 + idx * 22;
    canvas.rect(44, y - 15, 524, 21, {
      stroke: true,
      fill: idx % 2 === 0,
      strokeColor: THEME.cardBorder,
      fillColor: THEME.mutedRow
    });
    canvas.text(colX[0], y, String(row.week), { bold: true, size: 10, color: THEME.moss });
    canvas.text(colX[1], y, row.dateTimeText, { size: 9, color: THEME.stone });
    canvas.text(colX[2], y, truncate(row.matchupText, 36), { size: 10, bold: true, color: THEME.ink });
    canvas.text(colX[3], y, row.courtText || "-", { size: 9, align: "right", color: THEME.stone });
  });

  canvas.text(44, 746, "Generated from League Scoring Hub", {
    size: 8,
    color: THEME.stone
  });

  return buildPdf([canvas.toPage()]);
}

export function toTeamScheduleRows(teamName: string, rows: ScheduleRow[]): TeamScheduleRow[] {
  return rows.map((row) => {
    const isHome = row.homeTeam === teamName;
    const opponent = isHome ? row.awayTeam : row.homeTeam;
    return {
      week: row.week,
      dateTimeText: `${row.dateText} ${row.timeText}`,
      matchupText: `${isHome ? "vs" : "at"} ${opponent}`,
      courtText: row.courtText
    };
  });
}
