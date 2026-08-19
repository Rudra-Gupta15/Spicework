import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { Navbar } from "@/components/layout/Navbar";
import {
  CreateSearchModal,
  type NewSearchDraft,
} from "@/components/savedSearch/CreateSearchModal";
import { SavedSearchFilters } from "@/components/savedSearch/SavedSearchFilters";
import { SavedSearchTable } from "@/components/savedSearch/SavedSearchTable";
import {
  Button,
  Card,
  ConfirmDialog,
  Loader,
  Pagination,
} from "@/components/ui";
import { CURRENT_COMPANY } from "@/config/company";
import {
  DEFAULT_SAVED_SEARCH_FILTERS,
  SAVED_SEARCH_TABS,
  createSavedSearch,
  deleteSavedSearch,
  filterSavedSearches,
  groupSavedSearches,
  isSavedSearchFiltered,
  useSavedSearches,
  type SavedSearchFilterState,
} from "@/data/savedSearches";
import { ApiError } from "@/lib/api";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { SavedSearch, SavedSearchCategory } from "@/types/savedSearch";

const PAGE_SIZE = 8;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error
    ? error.message
    : fallback;

const SavedSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createDialog = useDisclosure();

  /* A filter bar's "Save Filter" button lands here with the category it
     saved to, e.g. navigate("/saved-search", { state: { tab: "Software" } }). */
  const initialTab = (location.state as { tab?: SavedSearchCategory } | null)
    ?.tab;
  const [tab, setTab] = useState<SavedSearchCategory>(initialTab ?? "Hardware");
  const [filters, setFilters] = useState<SavedSearchFilterState>(
    DEFAULT_SAVED_SEARCH_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SavedSearch | null>(null);
  const [createError, setCreateError] = useState<string>();
  const [isSaving, setSaving] = useState(false);

  const { searches, isLoading, error, reload } = useSavedSearches(tab);

  const matches = useMemo(
    () => filterSavedSearches(searches, filters),
    [searches, filters],
  );

  /* Clamping beats resetting: narrowing the filters can never strand the
     view on a page that no longer exists. */
  /* Grouped before paging: one row per name, so the page count reflects rows
     on screen rather than saves in the database. */
  const groups = useMemo(() => groupSavedSearches(matches), [matches]);

  const lastPage = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const visible = useMemo(
    () => groups.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [matches, currentPage],
  );

  const changeFilters = useCallback(
    (patch: Partial<SavedSearchFilterState>) => {
      setFilters((current) => ({ ...current, ...patch }));
      setPage(1);
    },
    [],
  );

  const selectTab = (next: SavedSearchCategory) => {
    setTab(next);
    /* Each tab is its own list — a term typed for Hardware would silently
       hide most of Software. */
    setFilters(DEFAULT_SAVED_SEARCH_FILTERS);
    setPage(1);
  };

  const createSearch = useCallback(
    async (draft: NewSearchDraft) => {
      setCreateError(undefined);
      setSaving(true);
      try {
        const search = await createSavedSearch(tab, {
          name: draft.name,
          scope: draft.scope,
          filters: draft.filters,
          resultsCount: 0,
          createdBy: CURRENT_COMPANY.name,
        });
        createDialog.close();
        navigate(`/saved-search/${search.id}`);
      } catch (err) {
        setCreateError(errorMessage(err, "Could not save this search."));
      } finally {
        setSaving(false);
      }
    },
    [tab, createDialog, navigate],
  );

  const openSearch = useCallback(
    (search: SavedSearch) => navigate(`/saved-search/${search.id}`),
    [navigate],
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    void deleteSavedSearch(id).then(reload);
  }, [pendingDelete, reload]);

  return (
    <>
      <Navbar
        title="Filter Search"
        subtitle="Manage and run your saved search queries across all asset categories."
        actions={
          <>
            <Button
              variant="brand"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
              onClick={createDialog.open}
            >
              Create New
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </>
        }
      />

      <div className="mt-6 space-y-5">
        <DetailTabs
          tabs={SAVED_SEARCH_TABS}
          active={tab}
          onChange={selectTab}
        />

        <SavedSearchFilters
          filters={filters}
          onChange={changeFilters}
          matchCount={matches.length}
          totalCount={searches.length}
        />

        <Card className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">
            {tab} Filter Search
          </h2>

          {error && (
            <p className="mb-3 text-[13px] text-status-offline">{error}</p>
          )}

          {isLoading ? (
            <Loader label="Loading Filter Search…" />
          ) : (
            <SavedSearchTable
              groups={visible}
              onView={openSearch}
              onEdit={openSearch}
              onDelete={setPendingDelete}
              emptyMessage={
                isSavedSearchFiltered(filters)
                  ? "No Filter Search match your search."
                  : `No ${tab} Filter Search yet — save one from a filter bar or use Create New.`
              }
            />
          )}

          <Pagination
            className="mt-5"
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={groups.length}
            itemLabel="searches"
            onPageChange={setPage}
          />
        </Card>
      </div>

      <CreateSearchModal
        key={`${tab}-${createDialog.isOpen}`}
        isOpen={createDialog.isOpen}
        category={tab}
        onClose={() => {
          setCreateError(undefined);
          createDialog.close();
        }}
        onSave={(draft) => void createSearch(draft)}
        error={createError}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete saved search?"
        description={`"${pendingDelete?.name ?? ""}" will be removed for everyone it is shared with. This cannot be undone.`}
        cancelLabel="Cancel"
        confirmLabel="Delete Search"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default SavedSearchPage;
