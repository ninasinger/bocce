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

function drawHeader(canvas: PdfCanvas, title: string, subtitle: string) {
  canvas.rect(24, 24, 564, 70, {
    stroke: false,
    fill: true,
    fillColor: [0.94, 0.96, 0.93]
  });
  canvas.text(40, 52, title, { bold: true, size: 20, color: [0.1, 0.2, 0.18] });
  canvas.text(40, 76, subtitle, { size: 10, color: [0.35, 0.38, 0.36] });
}

function drawTableHeader(canvas: PdfCanvas, y: number, headers: string[], colX: number[]) {
  canvas.rect(36, y - 14, 540, 18, {
    stroke: false,
    fill: true,
    fillColor: [0.88, 0.9, 0.88]
  });
  headers.forEach((header, i) => {
    canvas.text(colX[i], y, header, { bold: true, size: 9, color: [0.17, 0.23, 0.2] });
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
    drawTableHeader(canvas, 122, headers, colX);

    pageRows.forEach((row, rowIndex) => {
      const y = 140 + rowIndex * 13;
      if (rowIndex % 2 === 1) {
        canvas.rect(36, y - 11, 540, 13, {
          stroke: false,
          fill: true,
          fillColor: [0.965, 0.975, 0.97]
        });
      }
      canvas.text(colX[0], y, String(row.week), { size: 8 });
      canvas.text(colX[1], y, `${row.dateText} ${row.timeText}`, { size: 8 });
      canvas.text(colX[2], y, row.courtText || "-", { size: 8 });
      canvas.text(colX[3], y, truncate(row.homeTeam, 22), { size: 8, bold: true });
      canvas.text(colX[4], y, truncate(row.awayTeam, 22), { size: 8, bold: true });
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
  drawHeader(canvas, `${teamName} Schedule`, `${seasonName} • ${rows.length} matches`);

  canvas.rect(36, 110, 540, 618, {
    stroke: true,
    fill: false,
    strokeColor: [0.74, 0.8, 0.78],
    lineWidth: 1
  });

  const colX = [48, 86, 226, 504];
  drawTableHeader(canvas, 132, ["WK", "DATE / TIME", "MATCHUP", "COURT"], colX);

  rows.slice(0, 24).forEach((row, idx) => {
    const y = 152 + idx * 23;
    canvas.rect(44, y - 15, 524, 21, {
      stroke: true,
      fill: idx % 2 === 0,
      strokeColor: [0.86, 0.88, 0.87],
      fillColor: [0.98, 0.99, 0.98]
    });
    canvas.text(colX[0], y, String(row.week), { bold: true, size: 10, color: [0.16, 0.22, 0.19] });
    canvas.text(colX[1], y, row.dateTimeText, { size: 9 });
    canvas.text(colX[2], y, truncate(row.matchupText, 36), { size: 10, bold: true });
    canvas.text(colX[3], y, row.courtText || "-", { size: 9, align: "right" });
  });

  canvas.text(44, 746, "Generated from League Scoring Hub", {
    size: 8,
    color: [0.45, 0.47, 0.46]
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
