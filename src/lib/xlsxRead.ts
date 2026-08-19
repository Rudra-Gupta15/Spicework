/* -------------------------------------------------------------------------
 * A tiny .xlsx reader — the other direction from `lib/xlsx`.
 *
 * An xlsx file is a ZIP of XML parts, so this reads just enough of both: the
 * ZIP central directory, the shared string table, the first worksheet, and
 * the number formats needed to tell a date from the serial number Excel
 * actually stores. Compressed parts are inflated by the platform's own
 * `DecompressionStream`, so there is still no dependency here.
 *
 * People export from Excel far more often than they export to CSV, and
 * telling somebody to "save it as CSV first" is a step that loses files.
 * ---------------------------------------------------------------------- */

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;

/** One file inside the archive, as the central directory describes it. */
interface ZipEntry {
  name: string;
  /** 0 = stored, 8 = deflated. Anything else this reader cannot open. */
  method: number;
  compressedSize: number;
  offset: number;
}

const readU16 = (bytes: Uint8Array, at: number): number =>
  bytes[at] | (bytes[at + 1] << 8);

const readU32 = (bytes: Uint8Array, at: number): number =>
  (bytes[at] |
    (bytes[at + 1] << 8) |
    (bytes[at + 2] << 16) |
    (bytes[at + 3] << 24)) >>>
  0;

/** The end-of-central-directory record sits at the tail, after any comment. */
const findEocd = (bytes: Uint8Array): number => {
  for (let at = bytes.length - 22; at >= 0; at -= 1)
    if (readU32(bytes, at) === EOCD_SIGNATURE) return at;

  return -1;
};

const readDirectory = (bytes: Uint8Array): ZipEntry[] => {
  const eocd = findEocd(bytes);
  if (eocd < 0) return [];

  const count = readU16(bytes, eocd + 10);
  let at = readU32(bytes, eocd + 16);

  const entries: ZipEntry[] = [];
  const decoder = new TextDecoder();

  for (let index = 0; index < count; index += 1) {
    if (readU32(bytes, at) !== CENTRAL_SIGNATURE) break;

    const nameLength = readU16(bytes, at + 28);
    const extraLength = readU16(bytes, at + 30);
    const commentLength = readU16(bytes, at + 32);

    entries.push({
      name: decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength)),
      method: readU16(bytes, at + 10),
      compressedSize: readU32(bytes, at + 20),
      offset: readU32(bytes, at + 42),
    });

    at += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
};

const inflate = async (data: Uint8Array): Promise<Uint8Array> => {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));

  return new Uint8Array(await new Response(stream).arrayBuffer());
};

/** One part of the archive as text, or "" when it is not in there. */
const readPart = async (
  bytes: Uint8Array,
  entries: ZipEntry[],
  name: string,
): Promise<string> => {
  const entry = entries.find((candidate) => candidate.name === name);
  if (!entry) return "";

  /* The local header repeats the name and extra fields, and only it says how
     long they are here — the data starts after them. */
  const nameLength = readU16(bytes, entry.offset + 26);
  const extraLength = readU16(bytes, entry.offset + 28);
  const start = entry.offset + 30 + nameLength + extraLength;
  const raw = bytes.subarray(start, start + entry.compressedSize);

  if (entry.method === 0) return new TextDecoder().decode(raw);
  if (entry.method !== 8) return "";

  return new TextDecoder().decode(await inflate(raw));
};

/* --- XML, only as far as a worksheet needs ------------------------ */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

const decodeXml = (value: string): string =>
  value.replace(/&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g, (match, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X"))
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    if (code.startsWith("#"))
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10));

    return ENTITIES[code] ?? match;
  });

/** Every `<t>` inside a fragment, joined — a run-formatted cell has several. */
const textOf = (fragment: string): string =>
  [...fragment.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
    .map((match) => decodeXml(match[1]))
    .join("");

const readSharedStrings = (xml: string): string[] =>
  [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    textOf(match[1]),
  );

/* --- dates -------------------------------------------------------- */

/**
 * Excel stores a date as a day count and remembers only the format it should
 * be shown in, so a purchase date arrives as `45678` unless the format is
 * followed back. These are the built-in format ids that mean "date".
 */
const BUILTIN_DATE_FORMATS = new Set([
  14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47,
]);

/** Which cell formats are dates, indexed the way a cell's `s` attribute is. */
const readDateStyles = (xml: string): boolean[] => {
  const custom = new Map<number, string>();

  [...xml.matchAll(/<numFmt\b([^>]*)\/>/g)].forEach((match) => {
    const id = Number(/numFmtId="(\d+)"/.exec(match[1])?.[1] ?? "-1");
    const code = /formatCode="([^"]*)"/.exec(match[1])?.[1] ?? "";
    if (id >= 0) custom.set(id, decodeXml(code));
  });

  const cellXfs = /<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(xml)?.[1] ?? "";

  return [...cellXfs.matchAll(/<xf\b([^>]*?)(?:\/>|>)/g)].map((match) => {
    const id = Number(/numFmtId="(\d+)"/.exec(match[1])?.[1] ?? "0");

    if (BUILTIN_DATE_FORMATS.has(id)) return true;

    /* A custom format is a date when its code talks about days or years and
       is not a plain number or a bit of text. */
    const code = custom.get(id);
    return code !== undefined && /[dy]/i.test(code.replace(/\[[^\]]*\]/g, ""));
  });
};

const pad = (value: number): string => String(value).padStart(2, "0");

/** Day 1 is 1 Jan 1900, and Excel believes 1900 was a leap year. */
const serialToDate = (serial: number): string => {
  const date = new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000);

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
};

/* --- the sheet ---------------------------------------------------- */

/** `BC12` → 54; the letters are a base-26 number with no zero. */
const columnIndex = (reference: string): number => {
  const letters = /^([A-Z]+)/.exec(reference)?.[1] ?? "A";

  return (
    letters
      .split("")
      .reduce((total, letter) => total * 26 + (letter.charCodeAt(0) - 64), 0) - 1
  );
};

const readSheet = (
  xml: string,
  shared: string[],
  dateStyles: boolean[],
): string[][] => {
  const rows: string[][] = [];

  [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].forEach((rowMatch) => {
    const cells: string[] = [];

    [...rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)].forEach(
      (cellMatch) => {
        const attributes = cellMatch[1];
        const body = cellMatch[2] ?? "";

        const reference = /r="([A-Z]+\d+)"/.exec(attributes)?.[1];
        const at = reference ? columnIndex(reference) : cells.length;
        const type = /t="([^"]+)"/.exec(attributes)?.[1] ?? "n";
        const style = Number(/s="(\d+)"/.exec(attributes)?.[1] ?? "-1");

        const raw = decodeXml(
          /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? "",
        );

        let value: string;

        if (type === "s") value = shared[Number(raw)] ?? "";
        else if (type === "inlineStr") value = textOf(body);
        else if (type === "b") value = raw === "1" ? "TRUE" : "FALSE";
        else if (
          type === "n" &&
          raw !== "" &&
          style >= 0 &&
          dateStyles[style] === true
        )
          value = serialToDate(Number(raw));
        else value = raw;

        /* Empty cells are not written out at all, so the gaps between the
           references have to be filled in. */
        while (cells.length < at) cells.push("");
        cells[at] = value;
      },
    );

    rows.push(cells);
  });

  /* A sheet keeps its shape long after the data stops — trailing blank rows
     are formatting, not records. */
  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === ""))
    rows.pop();

  return rows;
};

/**
 * The first worksheet of a workbook, as rows of cells — the same shape
 * `parseCsv` returns, so an upload does not care which of the two it got.
 * Throws with something sayable when the file is not a workbook this can
 * open, because that message goes straight in front of the user.
 */
export const readXlsx = async (data: ArrayBuffer): Promise<string[][]> => {
  const bytes = new Uint8Array(data);
  const entries = readDirectory(bytes);

  if (entries.length === 0)
    throw new Error("That file is not a workbook this can open.");

  const sheetName =
    entries.find((entry) => entry.name === "xl/worksheets/sheet1.xml")?.name ??
    entries.find((entry) => /^xl\/worksheets\/.*\.xml$/.test(entry.name))?.name;

  if (!sheetName) throw new Error("That workbook has no worksheet in it.");

  const [sheet, shared, styles] = await Promise.all([
    readPart(bytes, entries, sheetName),
    readPart(bytes, entries, "xl/sharedStrings.xml"),
    readPart(bytes, entries, "xl/styles.xml"),
  ]);

  if (sheet === "")
    throw new Error(
      "That workbook is compressed in a way this cannot open — save it as CSV and try again.",
    );

  return readSheet(sheet, readSharedStrings(shared), readDateStyles(styles));
};
