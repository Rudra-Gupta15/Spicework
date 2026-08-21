import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";

import { Badge, Button, Card, ConfirmDialog, DataTable, Loader, PRIMARY_CELL, Pagination, type Column } from "@/components/ui";
import { DeviceScanHistoryModal } from "@/components/common/DeviceScanHistoryModal";
import { SearchResultFilters } from "@/components/savedSearch/SearchResultFilters";
import { SavedSearchVersionMenu } from "@/components/savedSearch/SavedSearchVersionMenu";
import {
  deleteSavedSearch,
  fetchSavedSearchById,
  savedAtLabel,
  useSavedSearches,
} from "@/data/savedSearches";
import {
  DEFAULT_RESULT_FILTERS,
  filterResults,
  isResultFiltered,
  resultFilterOptions,
  type SearchResultFilterState,
} from "@/data/savedSearchResults";
import { hardwareSavedQuery, runSavedSearch } from "@/data/savedSearchRun";
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
  /* Computer name of the row whose scan trail is open — `null` while closed. */
  const [scanHistoryFor, setScanHistoryFor] = useState<string | null>(null);

  const [found, setFound] = useState<{ category: SavedSearchCategory; search: SavedSearch } | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string>();

  /* Switching to another save under the same name changes only the id in the
     route, so without this the previous save's results would sit under the new
     one's heading until the fetch lands. Filters and the page reset with it —
     a different save is a different result set. Derived during render rather
     than in the effect below, so the stale view never paints. */
  const [loadedId, setLoadedId] = useState(searchId);
  if (searchId && loadedId !== searchId) {
    setLoadedId(searchId);
    setFound(null);
    setNotFound(false);
    setError(undefined);
    setLoading(true);
    setPage(1);
    setFilters(DEFAULT_RESULT_FILTERS);
    setScanHistoryFor(null);
  }

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

  /* Every save made under this name. They are auto-named "All <category> —
     <today>", so five saves in one day carry the same title and the heading
     alone cannot say which is open — this is what the switcher lists. */
  const { searches: categorySaves } = useSavedSearches(found?.category ?? "Hardware");

  const siblings = useMemo(() => {
    if (!found) return [];
    const name = found.search.name.trim().toLowerCase();
    return categorySaves
      .filter((entry) => entry.name.trim().toLowerCase() === name)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [found, categorySaves]);

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
  const stored = (
    search.appliedFilters ?? search.filters.split(",").map((f) => f.trim())
  ).filter(Boolean);

  /* A hardware save with no filters of its own runs pinned to the day it was
     made — see `hardwareSavedQuery`. That window is derived at run time
     rather than stored, so its chip is derived here too: without it the bar
     would claim no filter at all while the table below is narrowed to one
     day. */
  const pinnedChip =
    found.category === "Hardware" ? hardwareSavedQuery(search).pinnedChip : undefined;

  const chips = pinnedChip ? [...stored, pinnedChip] : stored;

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
    {
      key: "history",
      header: "History",
      className: "w-[150px]",
      /* Every machine has a trail worth opening, not only the ones that
         appeared twice above — a device scanned nightly for a month shows one
         row here and thirty entries behind it. */
      render: (device) => (
        <button
          type="button"
          onClick={() => setScanHistoryFor(device.name)}
          className="inline-flex items-center gap-2 rounded-md text-[13px] font-semibold text-brand transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          <History className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          View Scans
          <span className="sr-only"> for {device.name}</span>
        </button>
      ),
    },
  ];

  const handleDelete = () => {
    void deleteSavedSearch(search.id).then(() => navigate(SAVED_ROUTE));
  };

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[22px] leading-tight font-bold break-words text-heading sm:text-[26px]">
            {search.name}
            <Badge tone={search.scope === "Public" ? "success" : "neutral"}>
              {search.scope}
            </Badge>
          </h1>

          {/* The time, because the name repeats across every save made on the
              same day — it is the only thing that identifies this one. */}
          <p className="mt-1 text-[13px] text-muted">
            Saved {search.created} at {savedAtLabel(search)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <SavedSearchVersionMenu
            saves={siblings}
            currentId={search.id}
            onSelect={(next) => navigate(`${SAVED_ROUTE}/${next.id}`)}
          />
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

          {/* Said outright rather than left to be inferred from a shrinking
              count: this search was saved with nothing filtered, so it
              answers for the day it was made, and a machine scanned again
              since carries a newer date and falls outside it for good. */}
          {pinnedChip && (
            <p className="w-full text-[12px] leading-relaxed text-muted">
              Saved with no filters, so it answers for the day it was made.
              Devices scanned since then carry a newer date and fall outside it.
            </p>
          )}
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

      <DeviceScanHistoryModal
        device={scanHistoryFor}
        onClose={() => setScanHistoryFor(null)}
      />

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
