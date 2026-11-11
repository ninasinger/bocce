import type { PdfCanvas } from "./simplePdf";

type Rgb = [number, number, number];

// Majolica palette, matching tailwind.config.ts.
export const THEME = {
  pageBg: [0.984, 0.973, 0.945] as Rgb, // stucco
  cardBg: [1, 1, 1] as Rgb,
  cardBorder: [0.863, 0.89, 0.937] as Rgb, // tile
  cobalt: [0.118, 0.306, 0.612] as Rgb,
  cobaltSoft: [0.886, 0.914, 0.957] as Rgb,
  lemon: [0.949, 0.761, 0.188] as Rgb,
  ink: [0.078, 0.157, 0.294] as Rgb,
  slate: [0.337, 0.408, 0.541] as Rgb,
  mutedRow: [0.984, 0.973, 0.945] as Rgb
};

// Plain hyphen: the PDF writer emits raw text in Helvetica, so "·" would garble.
export function leagueTitle(seasonName: string) {
  return `John Pirelli Lodge Bocce - ${seasonName}`;
}

// A strip of majolica tiles built from squares (the writer has no paths).
function drawTileStrip(canvas: PdfCanvas, x: number, y: number, width: number) {
  const size = 20;
  for (let left = x; left + size <= x + width; left += size) {
    canvas.rect(left, y, size, size, { stroke: false, fill: true, fillColor: THEME.cobalt });
    canvas.rect(left + 4, y + 4, 12, 12, { stroke: false, fill: true, fillColor: [1, 1, 1] });
    canvas.rect(left + 7, y + 7, 6, 6, { stroke: false, fill: true, fillColor: THEME.lemon });
  }
}

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
  drawTileStrip(canvas, 36, 36, 540);
}

export function drawHeader(canvas: PdfCanvas, title: string, subtitle: string) {
  drawPageChrome(canvas);
  canvas.rect(36, 66, 540, 70, {
    stroke: true,
    fill: true,
    fillColor: THEME.pageBg,
    strokeColor: THEME.cardBorder
  });
  canvas.rect(36, 66, 540, 5, {
    stroke: false,
    fill: true,
    fillColor: THEME.lemon
  });
  canvas.text(52, 96, title, { bold: true, size: 20, color: THEME.cobalt });
  canvas.text(52, 118, subtitle, { size: 10, color: THEME.slate });
}

export function drawTableHeader(canvas: PdfCanvas, y: number, headers: string[], colX: number[]) {
  canvas.rect(36, y - 14, 540, 18, {
    stroke: false,
    fill: true,
    fillColor: THEME.cobaltSoft
  });
  headers.forEach((header, i) => {
    canvas.text(colX[i], y, header, { bold: true, size: 9, color: THEME.cobalt });
  });
}
