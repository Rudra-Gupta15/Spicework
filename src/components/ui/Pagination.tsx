import { cn } from "@/lib/cn";

import { Button } from "./Button";

/** How many page numbers the `numbered` variant shows at once. */
const WINDOW = 4;

interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  totalItems: number;
  /** Noun used in the summary, e.g. "devices". */
  itemLabel?: string;
  /** `numbered` swaps Previous/Next for a page list — used by long lists. */
  variant?: "prev-next" | "numbered";
  onPageChange: (page: number) => void;
  className?: string;
}

const pageButtonClass = (isCurrent: boolean) =>
  cn(
    "h-8 min-w-8 rounded-md border px-2 text-[13px] font-semibold transition-colors",
    "focus-visible:ring-2 focus-visible:ring-navy-300/50 focus-visible:outline-none",
    isCurrent
      ? "border-navy-300 bg-canvas text-heading"
      : "border-line bg-surface text-muted hover:bg-canvas hover:text-heading",
  );

/** "Showing 1-6 of 612 devices" + page controls. */
export const Pagination = ({
  page,
  pageSize,
  totalItems,
  itemLabel = "items",
  variant = "prev-next",
  onPageChange,
  className,
}: PaginationProps) => {
  const lastPage = Math.max(Math.ceil(totalItems / pageSize), 1);
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  /* Window of page numbers, kept around the current page. */
  const start = Math.max(1, Math.min(page - 1, lastPage - WINDOW + 1));
  const end = Math.min(lastPage, start + WINDOW - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <p className="text-sm text-muted">
        Showing {first}-{last} of {totalItems.toLocaleString()} {itemLabel}
      </p>

      {variant === "numbered" ? (
        <div className="flex items-center gap-1.5">
          {pages.map((number) => (
            <button
              key={number}
              type="button"
              aria-current={number === page ? "page" : undefined}
              aria-label={`Page ${number}`}
              onClick={() => onPageChange(number)}
              className={pageButtonClass(number === page)}
            >
              {number}
            </button>
          ))}

          {end < lastPage && (
            <span className="px-1 text-sm text-muted" aria-hidden="true">
              …
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
