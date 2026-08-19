import { Badge, DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SavedSearch } from "@/types/savedSearch";

interface SavedSearchTableProps {
  searches: SavedSearch[];
  onView: (search: SavedSearch) => void;
  onEdit: (search: SavedSearch) => void;
  onDelete: (search: SavedSearch) => void;
  /** "Nothing saved yet" and "nothing matched" are different problems. */
  emptyMessage?: string;
}

const actionBtn =
  "h-8 rounded-md border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2";

export const SavedSearchTable = ({
  searches,
  onView,
  onEdit,
  onDelete,
  emptyMessage = "No Filter Search in this category yet.",
}: SavedSearchTableProps) => {
  const columns: Column<SavedSearch>[] = [
    { key: "name", header: "Search Name", cellClassName: PRIMARY_CELL },
    {
      key: "scope",
      header: "Scope",
      render: (search) => (
        <Badge tone={search.scope === "Public" ? "info" : "neutral"}>
          {search.scope}
        </Badge>
      ),
    },
    { key: "filters", header: "Filters", cellClassName: "text-muted" },
    { key: "results", header: "Results", cellClassName: "font-semibold" },
    { key: "created", header: "Created", cellClassName: "text-muted" },
    {
      key: "actions",
      header: "Actions",
      /* Reserve the hover width so the row does not jump on hover. */
      className: "w-[230px]",
      /* The row itself opens the search, so the actions keep the click. */
      render: (search) => (
        <div
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onView(search)}
            className={cn(
              actionBtn,
              "border-brand bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand/40",
            )}
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onEdit(search)}
            className={cn(
              actionBtn,
              "border-line bg-surface text-heading hover:bg-canvas focus-visible:ring-navy-300/50",
            )}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(search)}
            className={cn(
              actionBtn,
              "border-status-offline bg-surface text-status-offline hover:bg-red-50 focus-visible:ring-status-offline/40",
            )}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={searches}
      rowKey={(search) => search.id}
      onRowClick={onView}
      uppercaseHeaders
      bordered
      emptyMessage={emptyMessage}
    />
  );
};
