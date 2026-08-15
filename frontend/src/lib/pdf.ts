/* -------------------------------------------------------------------------
 * A tiny PDF writer — enough to lay out a titled report with a summary
 * block and paginated tables, with no third-party dependency. Everything
 * is drawn with the two base-14 Helvetica faces, so no font has to be
 * embedded and the output stays a few kilobytes.
 * ---------------------------------------------------------------------- */

/** One table rendered into the document. */
export interface PdfTable {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface PdfDocument {
  title: string;
  subtitle?: string;
  /** Small lines printed under the title bar — generated on, scope, … */
  meta?: string[];
  /** Label/value pairs printed above the tables. */
  summary?: [label: string, value: string][];
  tables: PdfTable[];
}

/* A4 landscape — report tables are wider than they are tall. */
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
/** Bottom of the drawable area; the footer sits below it. */
const BODY_BOTTOM = MARGIN + 18;

const HEADER_HEIGHT = 54;
const HEADER_HEIGHT_CONT = 28;

type Rgb = [number, number, number];

const NAVY: Rgb = [0.106, 0.165, 0.29];
const INK: Rgb = [0.12, 0.16, 0.23];
const MUTED: Rgb = [0.42, 0.47, 0.55];
const WHITE: Rgb = [1, 1, 1];
const BRAND: Rgb = [0.95, 0.51, 0.13];
const RULE: Rgb = [0.85, 0.88, 0.92];
const HEADER_FILL: Rgb = [0.94, 0.96, 0.98];
const ZEBRA: Rgb = [0.98, 0.985, 0.99];

/**
 * Characters the data carries that Helvetica's WinAnsi encoding cannot
 * express, mapped to the closest ASCII. Anything else outside Latin-1 is
 * replaced with "?" so one character always stays one byte — the xref
 * offsets are counted in bytes.
 */
const TRANSLITERATE: Record<string, string> = {
  "—": "-",
  "–": "-",
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "…": "...",
  " ": " ",
  "•": "-",
  "→": "->",
};

const sanitize = (text: string): string =>
  [...text]
    .map((char) => {
      const mapped = TRANSLITERATE[char];
      if (mapped) return mapped;
      const code = char.codePointAt(0) ?? 63;
      return code < 256 ? char : "?";
    })
    .join("")
    .replace(/[\r\n\t]+/g, " ");

/** Escapes the three characters a PDF string literal treats specially. */
const escapeText = (text: string): string =>
  sanitize(text).replace(/[\\()]/g, (char) => `\\${char}`);

/**
 * Helvetica advance widths, averaged per character class. Exact metrics
 * would need the AFM tables; this is close enough to keep cells inside
 * their column, which is all the layout asks of it.
 */
const charWidth = (char: string): number => {
  if ("iljItf.,:;'|!".includes(char)) return 0.3;
  if ("rs()[]-/\\ ".includes(char)) return 0.38;
  if ("MW@%".includes(char)) return 0.85;
  if (char >= "A" && char <= "Z") return 0.68;
  if (char >= "0" && char <= "9") return 0.556;
  return 0.52;
};

const textWidth = (text: string, size: number, bold: boolean): number => {
  const base = [...sanitize(text)].reduce((sum, char) => sum + charWidth(char), 0);
  return base * size * (bold ? 1.06 : 1);
};

/** Shortens `text` with an ellipsis until it fits inside `maxWidth`. */
const fitText = (
  text: string,
  maxWidth: number,
  size: number,
  bold: boolean,
): string => {
  if (textWidth(text, size, bold) <= maxWidth) return text;

  let clipped = sanitize(text);
  while (clipped.length > 1 && textWidth(`${clipped}...`, size, bold) > maxWidth)
    clipped = clipped.slice(0, -1);

  return `${clipped}...`;
};

const rgb = ([r, g, b]: Rgb, stroke = false): string =>
  `${r} ${g} ${b} ${stroke ? "RG" : "rg"}`;

/* ------------------------------------------------------------------ */

/** Collects drawing operators into pages and lays the document out. */
class PdfBuilder {
  private pages: string[][] = [];
  private ops: string[] = [];
  private y = 0;
  private readonly doc: PdfDocument;

  constructor(doc: PdfDocument) {
    this.doc = doc;
  }

  build(): string {
    this.startPage(true);
    this.drawSummary();
    this.doc.tables.forEach((table) => this.drawTable(table));
    this.drawFooters();

    return this.serialize();
  }

  /* --- primitives ------------------------------------------------- */

  private text(
    x: number,
    y: number,
    value: string,
    { size = 9, bold = false, color = INK }: { size?: number; bold?: boolean; color?: Rgb } = {},
  ): void {
    this.ops.push(
      `BT ${rgb(color)} /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapeText(value)}) Tj ET`,
    );
  }

  private rect(x: number, y: number, width: number, height: number, color: Rgb): void {
    this.ops.push(`${rgb(color)} ${x} ${y} ${width} ${height} re f`);
  }

  private line(x1: number, y1: number, x2: number, y2: number, color: Rgb = RULE): void {
    this.ops.push(`${rgb(color, true)} 0.5 w ${x1} ${y1} m ${x2} ${y2} l S`);
  }

  /* --- layout ----------------------------------------------------- */

  private startPage(first: boolean): void {
    this.ops = [];
    this.pages.push(this.ops);

    const height = first ? HEADER_HEIGHT : HEADER_HEIGHT_CONT;
    const top = PAGE_HEIGHT - height;

    this.rect(0, top, PAGE_WIDTH, height, NAVY);
    /* Brand rule under the bar, so the report reads as ours. */
    this.rect(0, top - 3, PAGE_WIDTH, 3, BRAND);

    if (first) {
      this.text(MARGIN, top + 30, this.doc.title, { size: 16, bold: true, color: WHITE });
      if (this.doc.subtitle)
        this.text(MARGIN, top + 13, this.doc.subtitle, { size: 9, color: [0.78, 0.83, 0.9] });
    } else {
      this.text(MARGIN, top + 10, this.doc.title, { size: 9.5, bold: true, color: WHITE });
    }

    this.y = top - 22;

    if (first && this.doc.meta?.length) {
      this.doc.meta.forEach((line) => {
        this.text(MARGIN, this.y, line, { size: 8.5, color: MUTED });
        this.y -= 12;
      });
      this.y -= 6;
    }
  }

  /** Breaks to a new page when `needed` points would run past the body. */
  private ensure(needed: number): void {
    if (this.y - needed >= BODY_BOTTOM) return;
    this.startPage(false);
  }

  private sectionTitle(title: string): void {
    this.ensure(34);
    this.text(MARGIN, this.y, title, { size: 11, bold: true });
    this.y -= 6;
    this.line(MARGIN, this.y, MARGIN + CONTENT_WIDTH, this.y);
    this.y -= 14;
  }

  private drawSummary(): void {
    const summary = this.doc.summary ?? [];
    if (summary.length === 0) return;

    this.sectionTitle("Summary");

    const columns = 3;
    const columnWidth = CONTENT_WIDTH / columns;
    const rows = Math.ceil(summary.length / columns);

    for (let row = 0; row < rows; row += 1) {
      this.ensure(30);

      for (let column = 0; column < columns; column += 1) {
        const field = summary[row * columns + column];
        if (!field) continue;

        const x = MARGIN + column * columnWidth;
        const width = columnWidth - 12;

        this.text(x, this.y, fitText(field[0].toUpperCase(), width, 7.5, true), {
          size: 7.5,
          bold: true,
          color: MUTED,
        });
        this.text(x, this.y - 12, fitText(field[1], width, 9, false), { size: 9 });
      }

      this.y -= 30;
    }

    this.y -= 4;
  }

  /**
   * Column widths proportional to the widest cell in each column, so a
   * serial-number column is not squeezed to match a status column.
   */
  private columnWidths(table: PdfTable): number[] {
    const natural = table.columns.map((header, index) =>
      Math.max(
        textWidth(header, 8, true),
        ...table.rows.map((row) => textWidth(row[index] ?? "", 8, false)),
      ),
    );

    const total = natural.reduce((sum, width) => sum + width, 0) || 1;
    const padding = 10;
    const available = CONTENT_WIDTH - padding * table.columns.length;

    return natural.map((width) => (width / total) * available + padding);
  }

  private drawTable(table: PdfTable): void {
    this.sectionTitle(table.title);

    if (table.rows.length === 0) {
      this.ensure(20);
      this.text(MARGIN, this.y, "No records reported.", { size: 8.5, color: MUTED });
      this.y -= 24;
      return;
    }

    const widths = this.columnWidths(table);
    const headerHeight = 18;
    const rowHeight = 16;

    const drawHeader = () => {
      this.rect(MARGIN, this.y - headerHeight + 5, CONTENT_WIDTH, headerHeight, HEADER_FILL);

      let x = MARGIN + 5;
      table.columns.forEach((header, index) => {
        this.text(x, this.y, fitText(header, widths[index] - 10, 8, true), {
          size: 8,
          bold: true,
          color: MUTED,
        });
        x += widths[index];
      });

      this.y -= headerHeight;
    };

    this.ensure(headerHeight + rowHeight * 2);
    drawHeader();

    table.rows.forEach((row, rowIndex) => {
      if (this.y - rowHeight < BODY_BOTTOM) {
        this.startPage(false);
        this.text(MARGIN, this.y, `${table.title} (continued)`, { size: 9.5, bold: true });
        this.y -= 18;
        drawHeader();
      }

      if (rowIndex % 2 === 1)
        this.rect(MARGIN, this.y - rowHeight + 4, CONTENT_WIDTH, rowHeight, ZEBRA);

      let x = MARGIN + 5;
      row.forEach((cell, index) => {
        const width = widths[index] ?? 60;
        this.text(x, this.y, fitText(cell ?? "", width - 10, 8, index === 0), {
          size: 8,
          bold: index === 0,
        });
        x += width;
      });

      this.y -= rowHeight;
      this.line(MARGIN, this.y + 4, MARGIN + CONTENT_WIDTH, this.y + 4);
    });

    this.y -= 18;
  }

  /** Page numbers need the final count, so they are stamped last. */
  private drawFooters(): void {
    const total = this.pages.length;

    this.pages.forEach((ops, index) => {
      this.ops = ops;
      this.line(MARGIN, MARGIN + 12, MARGIN + CONTENT_WIDTH, MARGIN + 12);
      this.text(MARGIN, MARGIN, this.doc.title, { size: 7.5, color: MUTED });

      const label = `Page ${index + 1} of ${total}`;
      this.text(MARGIN + CONTENT_WIDTH - textWidth(label, 7.5, false), MARGIN, label, {
        size: 7.5,
        color: MUTED,
      });
    });
  }

  /* --- file assembly ---------------------------------------------- */

  private serialize(): string {
    const objects: string[] = [];
    /* 1 catalog, 2 page tree, 3-4 fonts; pages and streams follow. */
    const firstPageObject = 5;

    objects.push("<< /Type /Catalog /Pages 2 0 R >>");

    const kids = this.pages
      .map((_page, index) => `${firstPageObject + index * 2} 0 R`)
      .join(" ");
    objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${this.pages.length} >>`);

    objects.push(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    );
    objects.push(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    );

    this.pages.forEach((ops, index) => {
      const contentId = firstPageObject + index * 2 + 1;
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
          `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
      );

      const stream = ops.join("\n");
      objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    });

    let file = "%PDF-1.4\n";
    const offsets: number[] = [];

    objects.forEach((body, index) => {
      offsets.push(file.length);
      file += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefStart = file.length;
    file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((offset) => {
      file += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    });

    file +=
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
      `startxref\n${xrefStart}\n%%EOF`;

    return file;
  }
}

/** Turns the one-byte-per-character PDF string into its bytes. */
const toBytes = (file: string): Uint8Array => {
  const bytes = new Uint8Array(file.length);
  for (let i = 0; i < file.length; i += 1) bytes[i] = file.charCodeAt(i) & 0xff;
  return bytes;
};

/** Renders `doc` to a PDF and hands it to the browser as a download. */
export const downloadPdf = (filename: string, doc: PdfDocument): void => {
  const bytes = toBytes(new PdfBuilder(doc).build());
  const url = URL.createObjectURL(
    new Blob([bytes as BlobPart], { type: "application/pdf" }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
