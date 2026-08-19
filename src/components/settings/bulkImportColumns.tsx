import { Badge, type Column } from "@/components/ui";
import type { ImportRow } from "@/types/bulkImport";

/**
 * The columns every import preview shares. A data type adds the two or three
 * that say which record a row is about; the row number, what it will do and
 * how it went are the same wherever the file came from.
 */

/** The "Row" column every preview starts with. */
export const importLineColumn = (): Column<ImportRow> => ({
  key: "line",
  header: "Row",
  className: "w-14",
  cellClassName: "text-muted tabular-nums",
});

/** One mapped value, straight out of the row. */
export const importValueColumn = (
  key: string,
  header: string,
  options: { className?: string } = {},
): Column<ImportRow> => ({
  key,
  header,
  cellClassName: options.className ?? "text-muted",
  render: (row) => row.values[key] || "—",
});

/** What the row will do to the estate — the whole point of an update run. */
export const importActionColumn = (): Column<ImportRow> => ({
  key: "action",
  header: "Action",
  className: "w-24",
  render: (row) =>
    row.action === "update" ? (
      <Badge tone="info">Update</Badge>
    ) : (
      <Badge tone="brand">Add</Badge>
    ),
});

/**
 * Where the row stands, with the reason in the same cell when there is one.
 * "Skipped" is a row the checks turned down before anything was written;
 * "Failed" was attempted and refused — the difference is what a retry can fix.
 */
export const importStatusColumn = (): Column<ImportRow> => ({
  key: "status",
  header: "Status",
  wrap: true,
  render: (row) => {
    if (row.state === "imported")
      return (
        <Badge tone="success">
          {row.action === "update" ? "Updated" : "Added"}
        </Badge>
      );

    if (row.state === "ready") return <Badge tone="neutral">Ready</Badge>;

    return (
      <div className="min-w-0">
        <Badge tone="danger">
          {row.state === "failed" ? "Failed" : "Skipped"}
        </Badge>
        {row.error && <p className="mt-1 text-[13px] text-muted">{row.error}</p>}
      </div>
    );
  },
});
