import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Badge, Button, Card, ConfirmDialog, DataTable, Loader, PRIMARY_CELL, Pagination, type Column } from "@/components/ui";
import { SearchResultFilters } from "@/components/savedSearch/SearchResultFilters";
import { deleteSavedSearch, fetchSavedSearchById } from "@/data/savedSearches";
import {
  DEFAULT_RESULT_FILTERS,
  filterResults,
  isResultFiltered,
  resultFilterOptions,
  type SearchResultFilterState,
} from "@/data/savedSearchResults";
import { runSavedSearch } from "@/data/savedSearchRun";
import { useDeviceList } from "@/data/deviceApi";
import { useSoftwareInventory } from "@/data/softwareInventory";
import { ApiError } from "@/lib/api";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { SavedSearch, SavedSearchCategory, SearchResultDevice } from "@/types/savedSearch";

const SAVED_ROUTE = "/saved-search";
const PAGE_SIZE = 8;

const SavedSearchDetailPage = () => {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const deletePrompt = useDisclosure();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchResultFilterState>(DEFAULT_RESULT_FILTERS);

  const [found, setFound] = useState<{ category: SavedSearchCategory; search: SavedSearch } | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!searchId) return;
    let cancelled = false;
    fetchSavedSearchById(searchId)
      .then((result) => {
        if (cancelled) return;
        if (!result) setNotFound(true);
        else setFound(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError || err instanceof Error ? err.message : "Could not load this search.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchId]);

  /* The saved query is re-run against current data rather than replaying the
     row count stored the day it was saved — a saved search exists to be asked
     again, and an estate that has grown since should show that it has. */
  const { devices: allDevices, isLoading: devicesLoading } = useDeviceList();
  const { items: allSoftware, isLoading: softwareLoading } = useSoftwareInventory();

  const results = useMemo(
    () => (found ? runSavedSearch(found.category, found.search, allDevices, allSoftware) : []),
    [found, allDevices, allSoftware],
  );

  const resultsLoading = devicesLoading || (found?.category === "Software" && softwareLoading);

  /* What the saved query returned, narrowed by the bar above the table. */
  const matches = useMemo(
    () => filterResults(results, filters),
    [results, filters],
  );

  /* Options come from the whole result set rather than the narrowed list, so
     picking one dimension never empties the others. */
  const filterOptions = useMemo(() => resultFilterOptions(results), [results]);

  /* Clamping beats resetting: narrowing can never strand the view on a page
     that no longer exists. */
  const lastPage = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const visible = useMemo(
    () => matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [matches, currentPage],
  );

  const changeFilters = (patch: Partial<SearchResultFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_RESULT_FILTERS);
    setPage(1);
  };

  if (!searchId || notFound) return <Navigate to={SAVED_ROUTE} replace />;

  if (isLoading) {
    return (
      <Card className="p-8">
        <Loader label="Loading saved search…" />
      </Card>
    );
  }

  if (error || !found) {
    return (
      <>
        <Card className="p-8 text-center">
          <p className="text-sm text-status-offline">
            {error ?? "Could not load this search."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
            onClick={() => navigate(SAVED_ROUTE)}
          >
            Back
          </Button>
        </Card>
      </>
    );
  }

  const { search } = found;
  const chips = search.appliedFilters ?? search.filters.split(",").map((f) => f.trim());

  const columns: Column<SearchResultDevice>[] = [
    { key: "name", header: "Device Name", cellClassName: PRIMARY_CELL },
    {
      key: "status",
      header: "Status",
      render: (device) => (
        <span
          className={
            device.status === "ONLINE"
              ? "font-semibold text-status-online"
              : "font-semibold text-muted"
          }
        >
          {device.status}
        </span>
      ),
    },
    { key: "type", header: "Type", cellClassName: "text-muted" },
    { key: "manufacturer", header: "Manufacturer", cellClassName: "text-muted" },
    { key: "serial", header: "Serial Number", cellClassName: PRIMARY_CELL },
    { key: "lastScan", header: "Last Scan", cellClassName: "text-muted" },
  ];

  const handleDelete = () => {
    void deleteSavedSearch(search.id).then(() => navigate(SAVED_ROUTE));
  };

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[22px] leading-tight font-bold break-words text-heading sm:text-[26px]">
          {search.name}
          <Badge tone={search.scope === "Public" ? "success" : "neutral"}>
            {search.scope}
          </Badge>
        </h1>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline">Edit Search</Button>
          <Button
            variant="outline"
            className="border-status-offline text-status-offline hover:bg-red-50"
            onClick={deletePrompt.open}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
            onClick={() => navigate(SAVED_ROUTE)}
          >
            Back
          </Button>
        </div>
      </header>

      <div className="mt-6 space-y-5">
        <Card className="flex flex-wrap items-center gap-2.5 px-4 py-3">
          <span className="text-[13px] font-semibold text-heading">
            Filters:
          </span>
          {chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-1 text-[13px] font-medium text-brand-600"
            >
              {chip}
            </span>
          ))}
          {/* Live, not the count stored when this was saved — that number goes
              stale the moment a device is added, and reads as a bug. The saved
              figure is kept alongside it when the two have drifted. */}
          <span className="ml-1 text-[13px] text-muted">
            {resultsLoading
              ? "Running…"
              : `${results.length} results found${
                  results.length === search.results ? "" : ` (was ${search.results} when saved)`
                }`}
          </span>
        </Card>

        <Card className="px-5 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-heading">Search Results</h2>

            <p className="text-[13px] text-muted tabular-nums">
              {matches.length === results.length
                ? `${results.length} ${results.length === 1 ? "result" : "results"}`
                : `${matches.length} of ${results.length} results`}
            </p>
          </div>

          <div className="mb-4">
            <SearchResultFilters
              filters={filters}
              onChange={changeFilters}
              options={filterOptions}
              isFiltered={isResultFiltered(filters)}
              onClear={clearFilters}
            />
          </div>

          <DataTable
            columns={columns}
            rows={visible}
            rowKey={(device) => device.id}
            uppercaseHeaders
            bordered
            emptyMessage={
              isResultFiltered(filters)
                ? "No results match these filters."
                : "This search returned no matching records."
            }
          />

          <Pagination
            className="mt-5"
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={matches.length}
            itemLabel="results"
            onPageChange={setPage}
          />
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deletePrompt.isOpen}
        title="Delete saved search?"
        description={`"${search.name}" will be removed for everyone it is shared with. This cannot be undone.`}
        cancelLabel="Cancel"
        confirmLabel="Delete Search"
        onCancel={deletePrompt.close}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default SavedSearchDetailPage;
