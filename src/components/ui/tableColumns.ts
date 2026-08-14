import type { Column } from "./DataTable";

/**
 * Styling for a row's identifying cell — the row number and the name that
 * the rest of the row describes. Every other cell keeps the table default
 * (regular weight, heading colour), so all tables read the same way.
 */
export const PRIMARY_CELL = "font-semibold text-heading";

const NUMBER_COLUMN = {
  header: "#",
  className: "w-10",
  cellClassName: PRIMARY_CELL,
} as const;

/** Leading column that numbers the rows as they are rendered. */
export const indexColumn = <T,>(): Column<T> => ({
  key: "index",
  ...NUMBER_COLUMN,
  render: (_row, index) => index + 1,
});

/**
 * Leading column backed by a `sequence` field — use this when the scanner
 * assigns the numbers itself and gaps are meaningful.
 */
export const sequenceColumn = <T,>(): Column<T> => ({
  key: "sequence",
  ...NUMBER_COLUMN,
});
