import { cn } from "@/lib/cn";

import { Button } from "./Button";

interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  totalItems: number;
  /** Noun used in the summary, e.g. "devices". */
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
}

/** "Showing 1-6 of 612 devices" + previous/next controls. */
export const Pagination = ({
  page,
  pageSize,
  totalItems,
  itemLabel = "items",
  onPageChange,
  className,
}: PaginationProps) => {
  const lastPage = Math.max(Math.ceil(totalItems / pageSize), 1);
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

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
    </div>
  );
};
