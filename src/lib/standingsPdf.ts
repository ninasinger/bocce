import { buildPdf, PdfCanvas } from "./simplePdf";
import { THEME, drawHeader, leagueTitle } from "./pdfChrome";
import type { StandingRow } from "./standings";

// ASCII "..." because the PDF writer emits raw Helvetica text.
function truncate(value: string, max = 28) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

export function buildStandingsPdf(
  seasonName: string,
  throughWeek: number | null,
  rows: StandingRow[]
) {
  const canvas = new PdfCanvas();
  const subtitle = throughWeek
    ? `${leagueTitle(seasonName)} - Through Week ${throughWeek}`
    : leagueTitle(seasonName);
  drawHeader(canvas, "Standings", subtitle);

  // Same labels as the Standings page. Numbers are right-aligned at these edges.
  const colX = [48, 88, 330, 401, 486, 566];
  const headers = ["RANK", "TEAM", "GAMES PLAYED", "GAMES WON", "TOTAL SCORES", "TOTAL POINTS"];
  canvas.rect(36, 150, 540, 18, { stroke: false, fill: true, fillColor: THEME.cobaltSoft });
  headers.forEach((header, i) => {
    canvas.text(colX[i], 164, header, {
      bold: true,
      size: 9,
      color: THEME.cobalt,
      align: i >= 2 ? "right" : "left"
    });
  });

  // 30pt rows fit the 17-team summer league on one page.
  rows.forEach((row, index) => {
    const y = 192 + index * 30;
    if (index % 2 === 1) {
      canvas.rect(36, y - 19, 540, 30, { stroke: false, fill: true, fillColor: THEME.mutedRow });
    }
    canvas.text(colX[0], y, String(row.rank), { bold: true, size: 14, color: THEME.cobalt });
    canvas.text(colX[1], y, truncate(row.teamName), { bold: true, size: 11, color: THEME.ink });
    const numbers = [row.gamesPlayed, row.gamesWon, row.totalPoints, row.matchPoints];
    numbers.forEach((value, i) => {
      canvas.text(colX[i + 2], y, String(value), {
        size: 11,
        color: i === 3 ? THEME.cobalt : THEME.ink,
        bold: i === 3,
        align: "right"
      });
    });
  });

  return buildPdf([canvas.toPage()]);
}

export function standingsFilename(seasonName: string, extension: "pdf" | "csv") {
  const slug = seasonName
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${slug}_standings.${extension}`;
}
