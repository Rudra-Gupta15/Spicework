import { Badge, DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { type SavedSearchGroup } from "@/data/savedSearches";
import { cn } from "@/lib/cn";
import type { SavedSearch } from "@/types/savedSearch";

interface SavedSearchTableProps {
  /** One row per name, already grouped and paginated by the page — grouping a
      single page would split a group whose saves straddle a page boundary.
      Repeat saves are not listed here; they are reached from inside the
      search, where the version switcher tells them apart by time. */
  groups: SavedSearchGroup[];
  onView: (search: SavedSearch) => void;
  onEdit: (search: SavedSearch) => void;
  onDelete: (search: SavedSearch) => void;
  /** "Nothing saved yet" and "nothing matched" are different problems. */
  emptyMessage?: string;
  /**
   * Live re-run of each listed search, keyed by the id of the save shown, so
   * this column agrees with the one on the search's own page. Absent while the
   * estate is still loading.
   */
  liveResults?: Map<string, number>;
  /** The Filters column as the search actually runs — see `savedSearchFiltersLabel`. */
  filtersLabelFor?: (search: SavedSearch) => string;
}

const actionBtn =
  "h-8 rounded-md border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2";

export const SavedSearchTable = ({
  groups,
  onView,
  onEdit,
  onDelete,
  emptyMessage = "No Filter Search in this category yet.",
  liveResults,
  filtersLabelFor,
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
      render: (group) =>
        filtersLabelFor?.(group.latest) ?? group.latest.filters,
    },
    {
      key: "results",
      header: "Results",
      cellClassName: "font-semibold",
      /* The live count, not the one stored the day this was saved. The two
         drift apart the moment a device is added or rescanned, and a list
         quoting the stored figure beside a page quoting the live one reads as
         a bug in whichever the reader checked second. An em dash while the
         estate loads, rather than the stale number flashing to a new one. */
      render: (group) => {
        if (!liveResults) return <span className="text-muted">—</span>;

        const live = liveResults.get(group.latest.id);
        return live ?? group.latest.results;
      },
    },
    {
      key: "created",
      header: "Created",
      cellClassName: "text-muted",
      /* Just the date. The row stands for the name, not for one save, so a
         time here would claim to identify a single save it does not. How many
         saves sit behind it is said in the next column instead. */
      render: (group) => group.latest.created,
    },
    {
      key: "saves",
      header: "Saves",
      cellClassName: "text-muted",
      /* Silent when there is only one, so the column reads as an exception
         rather than as a "1" repeated down every row. */
      render: (group) =>
        group.saves.length > 1 ? (
          <span className="font-semibold text-heading">{group.saves.length}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      /* Reserve the hover width so the row does not jump on hover. */
      className: "w-[230px]",
      /* The row itself opens the search, so the actions keep the click. */
      render: ({ latest: search }) => (
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
      rows={groups}
      rowKey={(group) => group.latest.id}
      onRowClick={(group) => onView(group.latest)}
      uppercaseHeaders
      bordered
      emptyMessage={emptyMessage}
    />
  );
};
