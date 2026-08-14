import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { Navbar } from "@/components/layout/Navbar";
import {
  CreateSearchModal,
  type NewSearchDraft,
} from "@/components/savedSearch/CreateSearchModal";
import { SavedSearchTable } from "@/components/savedSearch/SavedSearchTable";
import { Button, Card, ConfirmDialog, Pagination } from "@/components/ui";
import { CURRENT_USER } from "@/config/user";
import {
  SAVED_SEARCHES,
  SAVED_SEARCH_TABS,
  addSavedSearch,
  deleteSavedSearch,
  filtersLabel,
} from "@/data/savedSearches";
import { runHardwareSearch } from "@/data/savedSearchResults";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { SavedSearch, SavedSearchCategory } from "@/types/savedSearch";

const PAGE_SIZE = 8;

/** Today, in the `Aug 4, 2026` format the list displays. */
const todayLabel = (): string =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

let sequence = 0;

const SavedSearchPage = () => {
  const navigate = useNavigate();
  const createDialog = useDisclosure();

  /* Snapshot the store on mount; a version bump re-reads it after edits. */
  const [, bump] = useState(0);
  const [tab, setTab] = useState<SavedSearchCategory>("Hardware");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SavedSearch | null>(null);

  const searches = SAVED_SEARCHES[tab];

  const visible = useMemo(
    () => searches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [searches, page],
  );

  const selectTab = (next: SavedSearchCategory) => {
    setTab(next);
    setPage(1);
  };

  const createSearch = useCallback(
    (draft: NewSearchDraft) => {
      sequence += 1;
      /* Hardware queries run against the estate; others just record intent. */
      const results =
        tab === "Hardware" ? runHardwareSearch(draft.filters).length : 0;

      const search: SavedSearch = {
        id: `${tab.toLowerCase().replace(/\s+/g, "-")}-new-${sequence}`,
        name: draft.name,
        scope: draft.scope,
        filters: filtersLabel(draft.filters),
        appliedFilters: draft.filters,
        results,
        createdBy: CURRENT_USER.name,
        created: todayLabel(),
      };

      addSavedSearch(tab, search);
      createDialog.close();
      navigate(`/saved-search/${search.id}`);
    },
    [tab, createDialog, navigate],
  );

  const openSearch = useCallback(
    (search: SavedSearch) => navigate(`/saved-search/${search.id}`),
    [navigate],
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;
    deleteSavedSearch(pendingDelete.id);
    setPendingDelete(null);
    /* Land back on a valid page if the last row of this one just went. */
    setPage((current) => {
      const lastPage = Math.max(
        Math.ceil((SAVED_SEARCHES[tab].length || 1) / PAGE_SIZE),
        1,
      );
      return Math.min(current, lastPage);
    });
    bump((value) => value + 1);
  }, [pendingDelete, tab]);

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

          <SavedSearchTable
            searches={visible}
            onView={openSearch}
            onEdit={openSearch}
            onDelete={setPendingDelete}
          />

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
        onClose={createDialog.close}
        onSave={createSearch}
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
