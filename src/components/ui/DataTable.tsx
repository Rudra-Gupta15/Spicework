import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  /** Defaults to `String(row[key])` when omitted. */
  render?: (row: T, index: number) => ReactNode;
  align?: "left" | "right" | "center";
  /** Allows the cell to wrap onto multiple lines (long serials, notes…). */
  wrap?: boolean;
  /** Extra classes for both the header cell and its column's cells. */
  className?: string;
  /** Extra classes for the body cells only. */
  cellClassName?: string;
}

const ALIGN = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** Stable row key — required so React can reconcile rows correctly. */
  rowKey: (row: T) => string;
  /** Wraps the table in a rounded outlined box. */
  bordered?: boolean;
  /** Renders header labels in small caps with tracking. */
  uppercaseHeaders?: boolean;
  /** Tighter rows and smaller type — for wide, column-heavy tables. */
  dense?: boolean;
  /** Makes rows interactive — fires on click and on Enter/Space. */
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Config-driven table used by every list in the app (audits, inventory…).
 * Scrolls horizontally on small screens instead of breaking the layout.
 */
export const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  bordered = false,
  uppercaseHeaders = false,
  dense = false,
  onRowClick,
  emptyMessage = "Nothing to show yet.",
  className,
}: DataTableProps<T>) => (
  <div
    className={cn(
      /* Keeps the horizontal bar from reading as a border under the last
         row — see `.scrollbar-slim-light` in index.css. */
      "scrollbar-slim-light w-full overflow-x-auto",
      bordered && "rounded-lg border border-line",
      className,
    )}
  >
    <table className="w-full min-w-[700px] border-collapse text-sm">
      <thead>
        <tr className={cn("bg-canvas", bordered ? "border-b" : "border-y", "border-line")}>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={cn(
                "font-semibold whitespace-nowrap text-muted",
                dense ? "px-3 py-2.5" : "px-4 py-3",
                uppercaseHeaders
                  ? "text-[11px] tracking-[0.06em] uppercase"
                  : "text-xs",
                ALIGN[column.align ?? "left"],
                column.className,
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-10 text-center text-sm text-muted"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr
              key={rowKey(row)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick && (() => onRowClick(row))}
              onKeyDown={
                onRowClick &&
                ((event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onRowClick(row);
                })
              }
              className={cn(
                "group border-b border-line last:border-0 hover:bg-canvas/60",
                onRowClick &&
                  "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "align-middle text-heading",
                    dense ? "px-3 py-2.5 text-[13px]" : "px-4 py-3",
                    column.wrap ? "whitespace-normal" : "whitespace-nowrap",
                    ALIGN[column.align ?? "left"],
                    column.className,
                    column.cellClassName,
                  )}
                >
                  {column.render
                    ? column.render(row, index)
                    : String((row as Record<string, unknown>)[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
