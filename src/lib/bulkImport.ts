import { parseCsv } from "@/lib/csv";
import { isValidEmail } from "@/lib/validation";
import type {
  ImportAction,
  ImportField,
  ImportMapping,
  ImportMode,
  ImportRow,
  ImportSummary,
  ImportTable,
} from "@/types/bulkImport";

/**
 * The engine behind every bulk upload. A data type hands it a list of
 * approved columns; everything here — reading the file, matching its columns
 * to those fields, checking each cell against the type it is allowed to hold
 * and deciding whether a row creates or updates — is the same whichever data
 * type asked. Nothing in this file writes anything: it produces rows with a
 * verdict on each, and the caller commits them one at a time.
 */

/* ── what may be uploaded ──────────────────────────────────────────── */

/**
 * The stages a file goes through, in the order the dialog walks them.
 * "Select" only appears for a data type that scopes an upload to records
 * picked first — assets do, users have nothing to pick from.
 */
export const BULK_IMPORT_STEPS = [
  "Select",
  "Upload",
  "Map",
  "Validate",
  "Preview",
  "Done",
] as const;

export type BulkImportStep = (typeof BULK_IMPORT_STEPS)[number];

/** The same walk for a data type with nothing to pick beforehand. */
export const UNSCOPED_IMPORT_STEPS = BULK_IMPORT_STEPS.filter(
  (step) => step !== "Select",
);

/** Extensions the picker accepts; anything else is refused before reading. */
export const ACCEPTED_IMPORT_FILES = [".csv", ".txt", ".xlsx"];

/** Beyond this a file is a data migration, not an upload. */
export const MAX_IMPORT_FILE_MB = 10;

/* ── reading the file ──────────────────────────────────────────────── */

/** What a headerless file's columns are called on the mapping step. */
const positionalHeader = (index: number): string => `Column ${index + 1}`;

/**
 * A file is treated as carrying a header when its first row reads like
 * labels rather than data — at least half of its cells match a known field.
 * Getting this wrong either way is recoverable: the mapping step shows what
 * was assumed and lets it be changed.
 */
const looksLikeHeader = (
  cells: string[],
  fields: readonly ImportField[],
): boolean => {
  const known = new Set(
    fields.flatMap((field) => [
      field.label.toLowerCase(),
      ...(field.aliases ?? []).map((alias) => alias.toLowerCase()),
    ]),
  );

  const matches = cells.filter((cell) =>
    known.has(cell.trim().toLowerCase()),
  ).length;

  return matches > 0 && matches >= Math.ceil(cells.length / 2);
};

/**
 * Rows of cells into a header row and the body under it. A CSV and the first
 * sheet of a workbook arrive here in the same shape, so an upload never has
 * to care which of the two it was handed.
 */
export const buildImportTable = (
  table: string[][],
  fields: readonly ImportField[],
): ImportTable => {
  if (table.length === 0) return { headers: [], hasHeader: false, body: [] };

  const width = table.reduce((max, cells) => Math.max(max, cells.length), 0);
  const hasHeader = looksLikeHeader(table[0], fields);

  const headers = Array.from({ length: width }, (_unused, index) =>
    hasHeader
      ? table[0][index]?.trim() || positionalHeader(index)
      : positionalHeader(index),
  );

  return { headers, hasHeader, body: hasHeader ? table.slice(1) : table };
};

/** The same, straight from CSV text. */
export const readImportTable = (
  text: string,
  fields: readonly ImportField[],
): ImportTable => buildImportTable(parseCsv(text), fields);

/* ── mapping ───────────────────────────────────────────────────────── */

/** Nothing in the file feeds this field. */
export const UNMAPPED = -1;

const normalise = (value: string): string =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, " ");

/**
 * Matches the file's columns to the fields by name, falling back to the
 * template order for a headerless file. Whatever it works out is only a
 * suggestion — the mapping step puts it in front of the user before a single
 * cell is read as a value.
 */
export const autoMapColumns = (
  fields: readonly ImportField[],
  table: ImportTable,
): ImportMapping => {
  const mapping: ImportMapping = {};

  if (!table.hasHeader) {
    /* A file without labels can only be read in the template order, and only
       as far as its columns reach. */
    fields.forEach((field, index) => {
      mapping[field.key] = index < table.headers.length ? index : UNMAPPED;
    });
    return mapping;
  }

  const taken = new Set<number>();
  const headers = table.headers.map(normalise);

  fields.forEach((field) => {
    const names = [field.label, ...(field.aliases ?? [])].map(normalise);

    const index = headers.findIndex(
      (header, position) =>
        !taken.has(position) && header !== "" && names.includes(header),
    );

    if (index >= 0) taken.add(index);
    mapping[field.key] = index >= 0 ? index : UNMAPPED;
  });

  return mapping;
};

/**
 * Why the mapping cannot be used yet, or undefined when it can. The
 * identifier is always needed — without it a row cannot be matched to
 * anything — and a run that creates records needs every required column.
 */
export const mappingIssue = (
  fields: readonly ImportField[],
  mapping: ImportMapping,
  mode: ImportMode,
): string | undefined => {
  const identifier = fields.find((field) => field.identifier);

  if (identifier && mapping[identifier.key] === UNMAPPED)
    return `${identifier.label} has to come from somewhere — it is how a row is matched to a record.`;

  if (mode !== "update") {
    const missing = fields.filter(
      (field) => field.required && mapping[field.key] === UNMAPPED,
    );

    if (missing.length > 0) {
      const labels = missing.map((field) => field.label).join(", ");
      const verb = missing.length === 1 ? "is" : "are";
      const them = missing.length === 1 ? "it" : "them";

      return `${labels} ${verb} needed to create a record. Map ${them}, or switch to updating existing records only.`;
    }
  }

  if (Object.values(mapping).every((column) => column === UNMAPPED))
    return "No columns are mapped yet.";

  return undefined;
};

/** The same column feeding two fields is a mistake worth pointing at. */
export const duplicateMappings = (mapping: ImportMapping): number[] => {
  const counts = new Map<number, number>();

  Object.values(mapping).forEach((column) => {
    if (column !== UNMAPPED) counts.set(column, (counts.get(column) ?? 0) + 1);
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([column]) => column);
};

/* ── per-cell validation ───────────────────────────────────────────── */

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

const pad = (value: number): string => String(value).padStart(2, "0");

const isRealDate = (year: number, month: number, day: number): boolean => {
  if (month < 1 || month > 12 || day < 1 || year < 1900 || year > 2999)
    return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

/**
 * Dates are stored as `yyyy-mm-dd`, but a spreadsheet rarely hands one over
 * that way. Day-first is assumed for the slashed forms — this product is
 * sold where that is how a date is written — and `12 Mar 2024` is read too,
 * because that is what a copied-out report looks like.
 */
export const parseImportDate = (raw: string): string | undefined => {
  const value = raw.trim();
  if (value === "") return "";

  const iso = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(value);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);

    return isRealDate(year, month, day)
      ? `${year}-${pad(month)}-${pad(day)}`
      : undefined;
  }

  const dayFirst = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(value);
  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const month = Number(dayFirst[2]);
    const year = Number(dayFirst[3]);

    return isRealDate(year, month, day)
      ? `${year}-${pad(month)}-${pad(day)}`
      : undefined;
  }

  const spelled = /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/.exec(value);
  if (spelled) {
    const day = Number(spelled[1]);
    const month = MONTHS.indexOf(spelled[2].slice(0, 3).toLowerCase()) + 1;
    const year = Number(spelled[3]);

    return isRealDate(year, month, day)
      ? `${year}-${pad(month)}-${pad(day)}`
      : undefined;
  }

  return undefined;
};

/** `1,20,000.50` with a currency symbol on it is still a price. */
const parseImportNumber = (raw: string): string | undefined => {
  const stripped = raw.replace(/[^0-9.-]/g, "");
  if (stripped === "") return undefined;

  const value = Number(stripped);
  return Number.isFinite(value) && value >= 0 ? String(value) : undefined;
};

/** How a cell reads once its type has been enforced, or why it cannot. */
interface CellVerdict {
  value: string;
  error?: string;
}

const checkCell = (field: ImportField, raw: string): CellVerdict => {
  const value = raw.trim();
  if (value === "") return { value: "" };

  switch (field.type) {
    case "email":
      return isValidEmail(value)
        ? { value }
        : { value, error: `${field.label} is not a valid email address.` };

    case "number":
    case "money": {
      const number = parseImportNumber(value);

      return number === undefined
        ? {
            value,
            error: `${field.label} has to be a number — "${value}" is not.`,
          }
        : { value: number };
    }

    case "date": {
      const date = parseImportDate(value);

      return date === undefined
        ? {
            value,
            error: `${field.label} "${value}" is not a date — use dd/mm/yyyy or yyyy-mm-dd.`,
          }
        : { value: date };
    }

    case "enum": {
      const match = field.options?.find(
        (option) => option.toLowerCase() === value.toLowerCase(),
      );

      return match
        ? { value: match }
        : { value, error: `Unknown ${field.label.toLowerCase()} "${value}".` };
    }

    default:
      return { value };
  }
};

/* ── building the rows ─────────────────────────────────────────────── */

interface BuildOptions {
  fields: readonly ImportField[];
  table: ImportTable;
  mapping: ImportMapping;
  mode: ImportMode;
  /** Whether a record with this identifier is already on the books. */
  exists: (identifier: string) => boolean;
  /** Rules the data type owns — a site that has to be known, a date order. */
  check?: (
    values: Record<string, string>,
    action: ImportAction,
  ) => string | undefined;
}

/**
 * Reads the mapped file into rows, each one carrying what it will do and
 * whether it can. The first rule that fails wins, so a row names the thing
 * to fix rather than a list of everything wrong with it at once.
 */
export const buildImportRows = ({
  fields,
  table,
  mapping,
  mode,
  exists,
  check,
}: BuildOptions): ImportRow[] => {
  const identifier = fields.find((field) => field.identifier);
  const seen = new Set<string>();
  const firstLine = table.hasHeader ? 2 : 1;

  return table.body.map((cells, index) => {
    const line = index + firstLine;
    const values: Record<string, string> = {};
    let cellError: string | undefined;

    fields.forEach((field) => {
      const column = mapping[field.key];
      if (column === UNMAPPED) return;

      const verdict = checkCell(field, cells[column] ?? "");
      values[field.key] = verdict.value;
      cellError ??= verdict.error;
    });

    const key = identifier ? (values[identifier.key] ?? "").toLowerCase() : "";

    /* Which way a row goes has to be settled before the rules are applied —
       an update is held to a different set of them than a create. */
    const onBooks = key !== "" && exists(key);

    const action: ImportAction =
      mode === "create"
        ? "create"
        : mode === "update"
          ? "update"
          : onBooks
            ? "update"
            : "create";

    const verdict = (): string | undefined => {
      if (cellError) return cellError;

      if (identifier) {
        const noun = identifier.label.toLowerCase();

        if (key === "") return `${identifier.label} is missing.`;

        if (seen.has(key)) return `This ${noun} appears twice in the file.`;
        seen.add(key);

        if (mode === "create" && onBooks)
          return "Already on record — switch to updating if that is what you meant.";

        if (mode === "update" && !onBooks)
          return `Nothing on record with this ${noun}.`;
      }

      /* An update only carries the columns the file bothered to include, so
         a blank there means "leave it alone" rather than "clear it".
         Required only has to hold for a row bringing a record into being. */
      if (action === "create") {
        const missing = fields.find(
          (field) =>
            field.required &&
            !field.fallback &&
            (values[field.key] ?? "") === "",
        );

        if (missing) return `${missing.label} is missing.`;
      }

      return check?.(values, action);
    };

    const failure = verdict();

    /* Defaults are filled in after the checks, so a fallback can never make
       a row look complete that was not. */
    if (!failure && action === "create")
      fields.forEach((field) => {
        if (field.fallback && (values[field.key] ?? "") === "")
          values[field.key] = field.fallback;
      });

    return {
      line,
      action,
      values,
      state: failure ? "invalid" : "ready",
      error: failure,
    };
  });
};

/* ── counting up ───────────────────────────────────────────────────── */

export const summarize = (rows: readonly ImportRow[]): ImportSummary => ({
  total: rows.length,
  created: rows.filter(
    (row) => row.state === "imported" && row.action === "create",
  ).length,
  updated: rows.filter(
    (row) => row.state === "imported" && row.action === "update",
  ).length,
  invalid: rows.filter((row) => row.state === "invalid").length,
  failed: rows.filter((row) => row.state === "failed").length,
});

/** Rows that did not make it, whether the checks or the write refused them. */
export const rejectedRows = (rows: readonly ImportRow[]): ImportRow[] =>
  rows.filter((row) => row.state === "invalid" || row.state === "failed");

/**
 * The rejected rows written back out in the template shape, with the reason
 * appended. Fix what the last column complains about, delete it, and the
 * file goes straight back in — which is what makes a partial import
 * survivable rather than something to start over from.
 */
export const errorReport = (
  fields: readonly ImportField[],
  mapping: ImportMapping,
  rows: readonly ImportRow[],
): { headers: string[]; rows: string[][] } => {
  const included = fields.filter((field) => mapping[field.key] !== UNMAPPED);

  return {
    headers: [...included.map((field) => field.label), "Row", "Error"],
    rows: rejectedRows(rows).map((row) => [
      ...included.map((field) => row.values[field.key] ?? ""),
      String(row.line),
      row.error ?? "",
    ]),
  };
};

/** The header the downloadable template carries — every approved column. */
export const templateHeaders = (fields: readonly ImportField[]): string[] =>
  fields.map((field) => field.label);
