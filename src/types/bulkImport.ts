/**
 * The vocabulary every bulk upload shares, whatever it is bringing in.
 *
 * A data type describes itself as a list of `ImportField`s; the engine in
 * `lib/bulkImport` reads a file against that list, and the dialog walks the
 * user through mapping, validation, preview, processing and the summary
 * without knowing whether the rows are people or laptops.
 */

/** What an upload is allowed to do to the records it matches. */
export type ImportMode = "create" | "update" | "upsert";

/**
 * The data types a column is allowed to hold. Anything a file offers that
 * does not fit is refused on the row rather than written half-understood.
 */
export type ImportValueType =
  | "text"
  | "email"
  | "number"
  | "money"
  | "date"
  | "enum";

/** One column of a data type's approved shape. */
export interface ImportField {
  key: string;
  /** Header the template writes, and what the mapping step calls it. */
  label: string;
  type: ImportValueType;
  /** Which fieldset the mapping step files it under. */
  group: string;
  /** Other spellings accepted when columns are matched automatically. */
  aliases?: readonly string[];
  /** The values allowed — `enum` only, matched case-insensitively. */
  options?: readonly string[];
  /** Must carry a value on a row that creates a record. */
  required?: boolean;
  /** The column that identifies the record. Exactly one field carries it. */
  identifier?: boolean;
  /** Used when a creating row leaves the column blank. */
  fallback?: string;
  /** Example value for the template and the mapping hint. */
  hint?: string;
}

/** Which file column each field reads, by index; -1 means "not in the file". */
export type ImportMapping = Record<string, number>;

/** What a row will do to the estate once it is processed. */
export type ImportAction = "create" | "update";

/**
 * Where a row stands. `invalid` failed the checks before anything was
 * written; `failed` was attempted and the write itself was refused — the
 * difference is what a retry can and cannot fix.
 */
export type ImportRowState = "ready" | "invalid" | "imported" | "failed";

/** One line of an uploaded file, checked against the records it will join. */
export interface ImportRow {
  /** 1-based line in the file, so an error points at something findable. */
  line: number;
  action: ImportAction;
  /** Cleaned values keyed by field key — only mapped columns are present. */
  values: Record<string, string>;
  state: ImportRowState;
  /** Why the row cannot be imported, or why the write was refused. */
  error?: string;
}

/** What a finished job did, counted once so every line of copy agrees. */
export interface ImportSummary {
  total: number;
  created: number;
  updated: number;
  /** Rows the checks refused before processing started. */
  invalid: number;
  /** Rows the write itself refused. */
  failed: number;
}

/** An uploaded file once it has been read into cells. */
export interface ImportTable {
  /** Header cells as written, or the synthesised ones for a headerless file. */
  headers: string[];
  hasHeader: boolean;
  body: string[][];
}
