/* -------------------------------------------------------------------------
 * A tiny .xlsx writer. An xlsx file is a ZIP of XML parts, so this module
 * carries just enough of both: a store-only (uncompressed) ZIP container
 * and the handful of parts Excel needs to open a workbook. No dependency,
 * and the result is a real workbook rather than a CSV wearing the
 * extension.
 * ---------------------------------------------------------------------- */

export interface XlsxSheet {
  name: string;
  /** First row is treated as the header and rendered bold. */
  rows: (string | number)[][];
}

/* --- ZIP ---------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1)
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[i] = value >>> 0;
  }

  return table;
})();

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1)
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

/** Fixed 1980-01-01 stamp — reproducible, and Excel ignores it anyway. */
const DOS_DATE = 0x0021;
const DOS_TIME = 0;

/** Builds a store-only ZIP archive from the given entries. */
const zip = (entries: ZipEntry[]): Uint8Array => {
  const encoder = new TextEncoder();

  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  entries.forEach(({ name, bytes }) => {
    const nameBytes = encoder.encode(name);
    const crc = crc32(bytes);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, DOS_TIME, true);
    local.setUint16(12, DOS_DATE, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, bytes.length, true);
    local.setUint32(22, bytes.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);

    locals.push(new Uint8Array(local.buffer), nameBytes, bytes);

    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true); // version made by
    central.setUint16(6, 20, true); // version needed
    central.setUint16(8, 0x0800, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, DOS_TIME, true);
    central.setUint16(14, DOS_DATE, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, bytes.length, true);
    central.setUint32(24, bytes.length, true);
    central.setUint16(28, nameBytes.length, true);
    central.setUint32(42, offset, true);

    centrals.push(new Uint8Array(central.buffer), nameBytes);

    offset += 30 + nameBytes.length + bytes.length;
  });

  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  const parts = [...locals, ...centrals, new Uint8Array(end.buffer)];
  const total = parts.reduce((sum, part) => sum + part.length, 0);

  const archive = new Uint8Array(total);
  let cursor = 0;
  parts.forEach((part) => {
    archive.set(part, cursor);
    cursor += part.length;
  });

  return archive;
};

/* --- workbook parts ------------------------------------------------ */

const escapeXml = (value: string): string =>
  value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });

/** `0` -> `A`, `26` -> `AA` — the column letters of a cell reference. */
const columnName = (index: number): string => {
  let name = "";
  let value = index;

  do {
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return name;
};

/** Excel rejects these in a sheet name, and caps the name at 31 chars. */
const sheetName = (name: string, index: number): string =>
  name.replace(/[[\]:*?/\\]/g, " ").trim().slice(0, 31) || `Sheet${index + 1}`;

const CONTENT_TYPES = (count: number): string =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
  `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
  Array.from(
    { length: count },
    (_unused, index) =>
      `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  ).join("") +
  `</Types>`;

const ROOT_RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
  `</Relationships>`;

/** Two cell formats: 0 plain, 1 bold on a light fill — the header row. */
const STYLES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>` +
  `<font><b/><sz val="11"/><color rgb="FF1B2A4A"/><name val="Calibri"/></font></fonts>` +
  `<fills count="3"><fill><patternFill patternType="none"/></fill>` +
  `<fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFEEF2F7"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>` +
  `</styleSheet>`;

const workbookXml = (sheets: XlsxSheet[]): string =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
  `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>` +
  sheets
    .map(
      (sheet, index) =>
        `<sheet name="${escapeXml(sheetName(sheet.name, index))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join("") +
  `</sheets></workbook>`;

const workbookRels = (count: number): string =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  Array.from(
    { length: count },
    (_unused, index) =>
      `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
  ).join("") +
  `<Relationship Id="rId${count + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
  `</Relationships>`;

/** Widths sized to the longest cell in each column, within reason. */
const columnsXml = (rows: (string | number)[][]): string => {
  const count = rows.reduce((max, row) => Math.max(max, row.length), 0);
  if (count === 0) return "";

  const widths = Array.from({ length: count }, (_unused, index) =>
    Math.min(
      52,
      Math.max(
        10,
        ...rows.map((row) => String(row[index] ?? "").length + 3),
      ),
    ),
  );

  return `<cols>${widths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
    )
    .join("")}</cols>`;
};

const sheetXml = (sheet: XlsxSheet): string => {
  const rows = sheet.rows
    .map((row, rowIndex) => {
      const style = rowIndex === 0 ? ' s="1"' : "";

      const cells = row
        .map((value, columnIndex) => {
          const ref = `${columnName(columnIndex)}${rowIndex + 1}`;

          if (typeof value === "number" && Number.isFinite(value))
            return `<c r="${ref}"${style}><v>${value}</v></c>`;

          const text = String(value ?? "");
          if (text === "") return `<c r="${ref}"${style}/>`;

          return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    columnsXml(sheet.rows) +
    `<sheetData>${rows}</sheetData></worksheet>`
  );
};

/** Builds a workbook from the sheets and hands it over as a download. */
export const downloadXlsx = (filename: string, sheets: XlsxSheet[]): void => {
  const encoder = new TextEncoder();
  const part = (name: string, xml: string): ZipEntry => ({
    name,
    bytes: encoder.encode(xml),
  });

  const archive = zip([
    part("[Content_Types].xml", CONTENT_TYPES(sheets.length)),
    part("_rels/.rels", ROOT_RELS),
    part("xl/workbook.xml", workbookXml(sheets)),
    part("xl/_rels/workbook.xml.rels", workbookRels(sheets.length)),
    part("xl/styles.xml", STYLES),
    ...sheets.map((sheet, index) =>
      part(`xl/worksheets/sheet${index + 1}.xml`, sheetXml(sheet)),
    ),
  ]);

  const url = URL.createObjectURL(
    new Blob([archive as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
