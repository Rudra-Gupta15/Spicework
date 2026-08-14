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
