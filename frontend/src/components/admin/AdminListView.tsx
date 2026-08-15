import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import {
  Button,
  Card,
  DataTable,
  Input,
  Pagination,
  Select,
  StatCard,
  type Column,
} from "@/components/ui";
import { ADMIN_STATUS_OPTIONS } from "@/data/admin";
import type { AdminStatus } from "@/types/admin";
import type { StatMetric } from "@/types/ui";

const PAGE_SIZE = 10;
const ALL = "All";

/** Describes the filter a list arrived with, e.g. "Site: HQ — Nagpur". */
export interface AdminListContext {
  label: string;
  value: string;
  onClear: () => void;
}

interface AdminListViewProps<T> {
  title: string;
  subtitle: string;
  /** Omit to let the list start straight at the table. */
  stats?: StatMetric[];
  tableTitle: string;
  /** One line under the table title — usually what a row click does. */
  hint?: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Everything the search box should look through, joined. */
  searchText: (row: T) => string;
  /** Omit for rows that have no lifecycle state — the filter is then hidden
      rather than shown with nothing to do. */
  status?: (row: T) => AdminStatus;
  searchPlaceholder: string;
  /** Noun used by the pagination summary, e.g. "organizations". */
  itemLabel: string;
  emptyMessage: string;
  context?: AdminListContext;
  onRowClick?: (row: T) => void;
  /** Extra controls rendered after the status filter. */
  filters?: ReactNode;
  /** Page-level actions placed before the "Back to Dashboard" button. */
  actions?: ReactNode;
}

/**
 * The shared shell behind the four admin lists the dashboard tiles open.
 * Each list only supplies its columns and data; the header, search, status
 * filter, drill-down context and pagination all behave identically.
 */
export const AdminListView = <T,>({
  title,
  subtitle,
  stats,
  tableTitle,
  hint,
  columns,
  rows,
  rowKey,
  searchText,
  status,
  searchPlaceholder,
  itemLabel,
  emptyMessage,
  context,
  onRowClick,
  filters,
  actions,
}: AdminListViewProps<T>) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter(
      (row) =>
        (statusFilter === ALL || !status || status(row) === statusFilter) &&
        (term === "" || searchText(row).toLowerCase().includes(term)),
    );
  }, [rows, search, statusFilter, searchText, status]);

  /* Clamping beats resetting: narrowing the filters can never strand the
     view on a page that no longer exists. */
  const lastPage = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const visible = useMemo(
    () => matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [matches, currentPage],
  );

  return (
    <>
      <Navbar
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {actions}
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </>
        }
      />

      <div className="mt-6 space-y-5">
        {stats && stats.length > 0 && (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((metric) => (
              <StatCard key={metric.id} metric={metric} />
            ))}
          </section>
        )}

        {context && (
          <Card className="flex flex-wrap items-center gap-2.5 px-4 py-3">
            <span className="text-[13px] font-semibold text-heading">
              {context.label}:
            </span>
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-[13px] font-medium text-brand-600">
              {context.value}
            </span>
            <button
              type="button"
              onClick={context.onClear}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-semibold text-muted transition-colors hover:text-heading"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              Clear filter
            </button>
          </Card>
        )}

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-heading">{tableTitle}</h2>
              {hint && <p className="mt-1 text-[13px] text-muted">{hint}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="search"
                size="sm"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
                containerClassName="w-full sm:w-auto sm:min-w-[220px]"
              />

              {status && (
                <Select
                  label="Status:"
                  aria-label="Filter by status"
                  options={ADMIN_STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  align="right"
                />
              )}

              {filters}
            </div>
          </div>

          <div className="mt-4">
            <DataTable
              columns={columns}
              rows={visible}
              rowKey={rowKey}
              onRowClick={onRowClick}
              bordered
              uppercaseHeaders
              emptyMessage={emptyMessage}
            />
          </div>

          <Pagination
            className="mt-5"
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={matches.length}
            itemLabel={itemLabel}
            variant={lastPage > 5 ? "numbered" : "prev-next"}
            onPageChange={setPage}
          />
        </Card>
      </div>
    </>
  );
};
