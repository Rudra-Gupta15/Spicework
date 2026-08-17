import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { Navbar } from "@/components/layout/Navbar";
import {
  CreateSearchModal,
  type NewSearchDraft,
} from "@/components/savedSearch/CreateSearchModal";
import { SavedSearchTable } from "@/components/savedSearch/SavedSearchTable";
import { Button, Card, ConfirmDialog, Loader, Pagination } from "@/components/ui";
import { CURRENT_COMPANY } from "@/config/company";
import {
  SAVED_SEARCH_TABS,
  createSavedSearch,
  deleteSavedSearch,
  useSavedSearches,
} from "@/data/savedSearches";
import { ApiError } from "@/lib/api";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { SavedSearch, SavedSearchCategory } from "@/types/savedSearch";

const PAGE_SIZE = 8;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

const SavedSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createDialog = useDisclosure();

  /* A filter bar's "Save Filter" button lands here with the category it
     saved to, e.g. navigate("/saved-search", { state: { tab: "Software" } }). */
  const initialTab = (location.state as { tab?: SavedSearchCategory } | null)?.tab;
  const [tab, setTab] = useState<SavedSearchCategory>(initialTab ?? "Hardware");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SavedSearch | null>(null);
  const [createError, setCreateError] = useState<string>();
  const [isSaving, setSaving] = useState(false);

  const { searches, isLoading, error, reload } = useSavedSearches(tab);

  const visible = useMemo(
    () => searches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [searches, page],
  );

  const selectTab = (next: SavedSearchCategory) => {
    setTab(next);
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
    void deleteSavedSearch(id).then(() => {
      reload();
      setPage((current) => {
        const remaining = searches.length - 1;
        const lastPage = Math.max(Math.ceil((remaining || 1) / PAGE_SIZE), 1);
        return Math.min(current, lastPage);
      });
    });
  }, [pendingDelete, reload, searches.length]);

  return (
    <>
      <Navbar
        title="Saved Searches"
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
        <DetailTabs tabs={SAVED_SEARCH_TABS} active={tab} onChange={selectTab} />

        <Card className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">
            {tab} Saved Searches
          </h2>

          {error && (
            <p className="mb-3 text-[13px] text-status-offline">{error}</p>
          )}

          {isLoading ? (
            <Loader label="Loading saved searches…" />
          ) : (
            <SavedSearchTable
              searches={visible}
              onView={openSearch}
              onEdit={openSearch}
              onDelete={setPendingDelete}
            />
          )}

          <Pagination
            className="mt-5"
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={searches.length}
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
