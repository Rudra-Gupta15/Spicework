import { Badge, DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { SavedSearchHistoryMenu } from "./SavedSearchHistoryMenu";
import { type SavedSearchGroup } from "@/data/savedSearches";
import { cn } from "@/lib/cn";
import type { SavedSearch } from "@/types/savedSearch";

interface SavedSearchTableProps {
  /** Already grouped and paginated by the page — grouping a single page would
      split a group whose saves straddle a page boundary. */
  groups: SavedSearchGroup[];
  onView: (search: SavedSearch) => void;
  onEdit: (search: SavedSearch) => void;
  onDelete: (search: SavedSearch) => void;
  /** "Nothing saved yet" and "nothing matched" are different problems. */
  emptyMessage?: string;
}

const actionBtn =
  "h-8 rounded-md border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2";

export const SavedSearchTable = ({
  groups,
  onView,
  onEdit,
  onDelete,
  emptyMessage = "No Filter Search in this category yet.",
}: SavedSearchTableProps) => {
  const columns: Column<SavedSearchGroup>[] = [
    {
      key: "name",
      header: "Search Name",
      cellClassName: PRIMARY_CELL,
      render: (group) => group.latest.name,
    },
    {
      key: "scope",
      header: "Scope",
      render: ({ latest }) => (
        <Badge tone={latest.scope === "Public" ? "info" : "neutral"}>
          {latest.scope}
        </Badge>
      ),
    },
    {
      key: "filters",
      header: "Filters",
      cellClassName: "text-muted",
      render: (group) => group.latest.filters,
    },
    {
      key: "results",
      header: "Results",
      cellClassName: "font-semibold",
      render: (group) => group.latest.results,
    },
    {
      key: "created",
      header: "Created",
      cellClassName: "text-muted",
      render: (group) => group.latest.created,
    },
    {
      key: "actions",
      header: "Actions",
      /* Reserve the hover width so the row does not jump on hover. */
      className: "w-[230px]",
      /* The row itself opens the search, so the actions keep the click. */
      render: ({ latest: search, saves }) => (
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
          <SavedSearchHistoryMenu
            saves={saves}
            onView={onView}
            onDelete={onDelete}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={groups}
      rowKey={(group) => group.latest.id}
      onRowClick={(group) => onView(group.latest)}
      uppercaseHeaders
      bordered
      emptyMessage={emptyMessage}
    />
  );
};
