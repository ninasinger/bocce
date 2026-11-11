import { buildPdf, PdfCanvas } from "./simplePdf";
import { THEME, drawHeader, drawTableHeader, leagueTitle } from "./pdfChrome";

export type ScheduleRow = {
  week: number;
  dayText: string;
  dateText: string;
  timeText: string;
  scheduledDatetime: string | null;
  courtText: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
};

type TeamScheduleRow = {
  week: number;
  dayText: string;
  dateTimeText: string;
  matchupText: string;
  courtText: string;
};

function truncate(value: string, max = 26) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function courtSortValue(courtText: string) {
  const match = courtText.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function daySortValue(dayText: string) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const index = days.findIndex((day) => day.toLowerCase() === dayText.toLowerCase());
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function dateSortValue(scheduledDatetime: string | null) {
  if (!scheduledDatetime) return Number.MAX_SAFE_INTEGER;
  const value = new Date(scheduledDatetime).getTime();
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function sortScheduleRows(rows: ScheduleRow[]) {
  return [...rows].sort((a, b) => {
    return (
      a.week - b.week ||
      daySortValue(a.dayText) - daySortValue(b.dayText) ||
      dateSortValue(a.scheduledDatetime) - dateSortValue(b.scheduledDatetime) ||
      courtSortValue(a.courtText) - courtSortValue(b.courtText) ||
      a.homeTeam.localeCompare(b.homeTeam) ||
      a.awayTeam.localeCompare(b.awayTeam)
    );
  });
}

export function buildFullLeagueSchedulePdf(seasonName: string, rows: ScheduleRow[]) {
  const title = leagueTitle(seasonName);
  const pages: PdfCanvas[] = [];
  const sortedRows = sortScheduleRows(rows);
  const rowsPerPage = 48;
  const colX = [42, 78, 128, 218, 270, 424];
  const headers = ["WK", "DAY", "DATE / TIME", "COURT", "TEAM 1", "TEAM 2"];

  for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
    const start = pageIndex * rowsPerPage;
    const end = start + rowsPerPage;
    const pageRows = sortedRows.slice(start, end);
    if (pageRows.length === 0) break;

    const canvas = new PdfCanvas();
    drawHeader(canvas, "Full League Schedule", `${title} - Page ${pageIndex + 1}`);
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
      canvas.text(colX[0], y, String(row.week), { size: 8, color: THEME.slate });
      canvas.text(colX[1], y, row.dayText || "-", { size: 8, color: THEME.slate });
      canvas.text(colX[2], y, `${row.dateText} ${row.timeText}`, { size: 8, color: THEME.slate });
      canvas.text(colX[3], y, row.courtText || "-", { size: 8, color: THEME.slate });
      canvas.text(colX[4], y, truncate(row.homeTeam, 20), { size: 8, bold: true, color: THEME.ink });
      canvas.text(colX[5], y, truncate(row.awayTeam, 20), { size: 8, bold: true, color: THEME.ink });
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
  drawHeader(canvas, leagueTitle(seasonName), teamName);

  canvas.rect(36, 152, 540, 576, {
    stroke: true,
    fill: true,
    fillColor: THEME.cardBg,
    strokeColor: THEME.cardBorder,
    lineWidth: 1
  });

  const colX = [48, 86, 136, 232, 504];
  drawTableHeader(canvas, 176, ["WK", "DAY", "DATE / TIME", "MATCHUP", "COURT"], colX);

  rows.slice(0, 24).forEach((row, idx) => {
    const y = 196 + idx * 22;
    canvas.rect(44, y - 15, 524, 21, {
      stroke: true,
      fill: idx % 2 === 0,
      strokeColor: THEME.cardBorder,
      fillColor: THEME.mutedRow
    });
    canvas.text(colX[0], y, String(row.week), { bold: true, size: 10, color: THEME.cobalt });
    canvas.text(colX[1], y, row.dayText || "-", { size: 9, color: THEME.slate });
    canvas.text(colX[2], y, row.dateTimeText, { size: 9, color: THEME.slate });
    canvas.text(colX[3], y, truncate(row.matchupText, 30), { size: 10, bold: true, color: THEME.ink });
    canvas.text(colX[4], y, row.courtText || "-", { size: 9, align: "right", color: THEME.slate });
  });

  return buildPdf([canvas.toPage()]);
}

export function toTeamScheduleRows(teamName: string, rows: ScheduleRow[]): TeamScheduleRow[] {
  return rows.map((row) => {
    const opponent = row.homeTeam === teamName ? row.awayTeam : row.homeTeam;
    return {
      week: row.week,
      dayText: row.dayText,
      dateTimeText: `${row.dateText} ${row.timeText}`,
      matchupText: opponent,
      courtText: row.courtText
    };
  });
}
