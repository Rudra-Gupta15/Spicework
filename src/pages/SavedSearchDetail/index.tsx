import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Badge, Button, Card, ConfirmDialog, DataTable, Loader, PRIMARY_CELL, Pagination, type Column } from "@/components/ui";
import { deleteSavedSearch, fetchSavedSearchById } from "@/data/savedSearches";
import { resultsForSearch } from "@/data/savedSearchResults";
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

  /* The result set below is still mocked — running a saved query against
     live data is a separate piece of work from persisting the search itself. */
  const results = useMemo(
    () => (found ? resultsForSearch(found.search) : []),
    [found],
  );

  const visible = useMemo(
    () => results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [results, page],
  );

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
          <span className="ml-1 text-[13px] text-muted">
            {search.results} results found
          </span>
        </Card>

        <Card className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">
            Search Results
          </h2>

          <DataTable
            columns={columns}
            rows={visible}
            rowKey={(device) => device.id}
            uppercaseHeaders
            bordered
            emptyMessage="This search returned no matching records."
          />

          <Pagination
            className="mt-5"
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={results.length}
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
