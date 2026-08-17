/** Quotes a value so commas, quotes and newlines survive the round trip. */
const escapeCell = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/**
 * Builds a CSV from a header row plus body rows and hands it to the browser
 * as a download — no server round trip needed for an export.
 */
export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: string[][],
): void => {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

/** Excel writes a byte-order mark; left in, it glues itself to the first cell. */
const stripBom = (text: string): string =>
  text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

/**
 * The other direction: CSV text to rows of cells. Handles quoted fields, so
 * a value containing a comma, an escaped quote or a line break survives a
 * round trip through `downloadCsv` unchanged.
 *
 * Blank lines are dropped — a spreadsheet export usually ends with one, and
 * an empty row is never a record.
 */
export const parseCsv = (text: string): string[][] => {
  /* Normalised up front so a file saved on Windows parses the same. */
  const source = stripBom(text).replace(/\r\n?/g, "\n");

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (quoted) {
      /* A doubled quote inside a quoted field is one literal quote. */
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }

  /* A file that does not end in a newline still has a last row in hand. */
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((value) => value.trim() !== ""));
};
