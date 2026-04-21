type PdfPage = {
  width: number;
  height: number;
  commands: string[];
};

type TextOptions = {
  size?: number;
  bold?: boolean;
  color?: [number, number, number];
  align?: "left" | "center" | "right";
};

type RectOptions = {
  stroke?: boolean;
  fill?: boolean;
  lineWidth?: number;
  strokeColor?: [number, number, number];
  fillColor?: [number, number, number];
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function esc(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function estimateTextWidth(text: string, size: number) {
  return text.length * size * 0.52;
}

export class PdfCanvas {
  private readonly commands: string[] = [];

  constructor(
    readonly width = 612,
    readonly height = 792
  ) {}

  private yFromTop(yTop: number) {
    return this.height - yTop;
  }

  rect(x: number, yTop: number, w: number, h: number, opts: RectOptions = {}) {
    const {
      stroke = true,
      fill = false,
      lineWidth = 1,
      strokeColor = [0, 0, 0],
      fillColor = [1, 1, 1]
    } = opts;
    const yBottom = this.height - yTop - h;
    this.commands.push(`${lineWidth} w`);
    this.commands.push(`${clamp01(strokeColor[0])} ${clamp01(strokeColor[1])} ${clamp01(strokeColor[2])} RG`);
    this.commands.push(`${clamp01(fillColor[0])} ${clamp01(fillColor[1])} ${clamp01(fillColor[2])} rg`);
    this.commands.push(`${x.toFixed(2)} ${yBottom.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`);
    this.commands.push(fill && stroke ? "B" : fill ? "f" : "S");
  }

  line(x1: number, yTop1: number, x2: number, yTop2: number, width = 1, color: [number, number, number] = [0, 0, 0]) {
    this.commands.push(`${width} w`);
    this.commands.push(`${clamp01(color[0])} ${clamp01(color[1])} ${clamp01(color[2])} RG`);
    this.commands.push(`${x1.toFixed(2)} ${this.yFromTop(yTop1).toFixed(2)} m`);
    this.commands.push(`${x2.toFixed(2)} ${this.yFromTop(yTop2).toFixed(2)} l`);
    this.commands.push("S");
  }

  text(x: number, yTop: number, text: string, options: TextOptions = {}) {
    const {
      size = 10,
      bold = false,
      color = [0, 0, 0],
      align = "left"
    } = options;
    const width = estimateTextWidth(text, size);
    let tx = x;
    if (align === "center") tx = x - width / 2;
    if (align === "right") tx = x - width;
    const ty = this.yFromTop(yTop);
    this.commands.push("BT");
    this.commands.push(`${clamp01(color[0])} ${clamp01(color[1])} ${clamp01(color[2])} rg`);
    this.commands.push(`/${bold ? "F2" : "F1"} ${size} Tf`);
    this.commands.push(`1 0 0 1 ${tx.toFixed(2)} ${ty.toFixed(2)} Tm`);
    this.commands.push(`(${esc(text)}) Tj`);
    this.commands.push("ET");
  }

  toPage(): PdfPage {
    return { width: this.width, height: this.height, commands: this.commands };
  }
}

export function buildPdf(pages: PdfPage[]) {
  const objects: string[] = [];
  const kids: string[] = [];
  const contentAndPageIds: Array<{ contentId: number; pageId: number }> = [];

  const fontRegularId = 1;
  const fontBoldId = 2;
  const pagesId = 3;
  const catalogId = 4;
  let nextId = 5;

  for (let i = 0; i < pages.length; i += 1) {
    const contentId = nextId++;
    const pageId = nextId++;
    kids.push(`${pageId} 0 R`);
    contentAndPageIds.push({ contentId, pageId });
  }

  objects[fontRegularId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[fontBoldId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    const ids = contentAndPageIds[i];
    const content = page.commands.join("\n");
    objects[ids.contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    objects[ids.pageId] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
      `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${ids.contentId} 0 R >>`;
  }

  objects[pagesId] = `<< /Type /Pages /Count ${pages.length} /Kids [${kids.join(" ")}] >>`;
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let output = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = output.length;
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefPos = output.length;
  output += `xref\n0 ${objects.length}\n`;
  output += "0000000000 65535 f \n";
  for (let id = 1; id < objects.length; id += 1) {
    output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new TextEncoder().encode(output);
}
