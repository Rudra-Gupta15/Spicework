import { downloadCsv } from "./csv";
import { downloadText } from "./download";

/** The two shapes a filtered list can be handed over in. */
export type ExportFormat = "csv" | "json";

/**
 * One column of an export: the header it carries, the field name a JSON
 * consumer sees, and how to read the value off a row. Declaring the reader
 * rather than assuming `row[key]` lets a page export something the row does
 * not literally hold — a joined list, a formatted total.
 */
export interface ExportColumn<T> {
  key: string;
  label: string;
  value: (row: T) => string;
}

/** `hardware-inventory-2026-08-17.csv` — dated, so two exports never collide. */
const filenameFor = (base: string, format: ExportFormat): string =>
  `${base}-${new Date().toISOString().slice(0, 10)}.${format}`;

/**
 * Writes the rows a table is currently showing to a file and returns what it
 * was called, so the caller can name it in a confirmation. Both formats carry
 * exactly the same columns and the same rows, so which one somebody picks is
 * only a question of what opens it.
 */
export const exportRows = <T>(
  base: string,
  format: ExportFormat,
  columns: ExportColumn<T>[],
  rows: T[],
): string => {
  const filename = filenameFor(base, format);

  if (format === "csv") {
    downloadCsv(
      filename,
      columns.map((column) => column.label),
      rows.map((row) => columns.map((column) => column.value(row))),
    );
    return filename;
  }

  /* Keyed by `key`, not `label`: a consumer wants field names that survive
     the header text being re-worded. */
  const payload = rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.key, column.value(row)])),
  );

  downloadText(
    filename,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8;",
  );

  return filename;
};
