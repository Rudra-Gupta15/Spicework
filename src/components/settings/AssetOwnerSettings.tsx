import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { LogAvatar } from "@/components/log/LogAvatar";
import {
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Input,
  Pagination,
  Select,
  type Column,
} from "@/components/ui";
import {
  ALL_SCOPES_LABEL,
  ASSET_OWNERS,
  addOwner,
  removeOwner,
  scopeFilterOptions,
  scopeLabel,
  updateOwner,
} from "@/data/assetFields";
import type { AssetOwner, AssetOwnerDraft } from "@/types/assetFields";

import { AssetOwnerModal } from "./AssetOwnerModal";
import { AssetScopeBadge } from "./AssetScopeBadge";

const PAGE_SIZE = 8;

/** Closed, adding (`owner: null`) or editing a specific row. */
type OwnerDialog = { owner: AssetOwner | null } | null;

/**
 * The owner directory: who an asset can be made the responsibility of. The
 * list is what the asset form's Owner dropdown is built from, which is why
 * an entry can be taken off it here but is never assigned here.
 */
export const AssetOwnerSettings = () => {
  /* A snapshot of the shared list — the write helpers mutate that array in
     place, so its identity never changes and React would not see the edit. */
  const [directory, setDirectory] = useState<AssetOwner[]>(() => [...ASSET_OWNERS]);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState(ALL_SCOPES_LABEL);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<OwnerDialog>(null);
  const [pendingDelete, setPendingDelete] = useState<AssetOwner | null>(null);

  const owners = useMemo(() => {
    const term = search.trim().toLowerCase();

    return directory.filter(
      (owner) =>
        (scope === ALL_SCOPES_LABEL || scopeLabel(owner) === scope) &&
        (term === "" ||
          `${owner.name} ${owner.email}`.toLowerCase().includes(term)),
    );
  }, [directory, search, scope]);

  /* Clamping beats resetting: narrowing the filters can never strand the
     view on a page that no longer exists. */
  const lastPage = Math.max(1, Math.ceil(owners.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const visible = useMemo(
    () => owners.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [owners, currentPage],
  );

  const save = (draft: AssetOwnerDraft) => {
    const editing = dialog?.owner;

    /* Written to the shared list first, so every picker built from it moves
       with the change, then mirrored into local state. */
    if (editing) {
      updateOwner(editing.id, draft);
      setDirectory((current) =>
        current.map((entry) =>
          entry.id === editing.id ? { ...entry, ...draft } : entry,
        ),
      );
    } else {
      const owner = addOwner(draft);
      setDirectory((current) => [owner, ...current]);
      setPage(1);
    }

    setDialog(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    removeOwner(pendingDelete.id);
    setDirectory((current) =>
      current.filter((entry) => entry.id !== pendingDelete.id),
    );
    setPendingDelete(null);
  };

  const columns: Column<AssetOwner>[] = useMemo(
    () => [
      {
        key: "owner",
        header: "Owner",
        render: (owner) => (
          <div className="flex items-center gap-3">
            <LogAvatar name={owner.name} kind="user" />
            <div className="min-w-0">
              <p className="font-semibold text-heading">{owner.name}</p>
              <p className="text-[13px] text-muted">{owner.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "scope",
        header: "Availability",
        render: (owner) => <AssetScopeBadge entry={owner} />,
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (owner) => (
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setDialog({ owner })}
              className="font-semibold text-brand transition-colors hover:text-brand-600 focus-visible:outline-none"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(owner)}
              className="font-semibold text-muted transition-colors hover:text-status-offline focus-visible:outline-none"
            >
              Remove
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Input
          type="search"
          size="md"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search owners by name or email..."
          aria-label="Search owners"
          leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
          containerClassName="min-w-[220px] flex-1"
        />

        <Select
          size="md"
          label="Scope:"
          options={scopeFilterOptions()}
          value={scope}
          onChange={(value) => {
            setScope(value);
            setPage(1);
          }}
          aria-label="Filter by scope"
        />

        <Button
          variant="brand"
          size="md"
          leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
          onClick={() => setDialog({ owner: null })}
        >
          Add Owner
        </Button>
      </Card>

      <Card className="px-5 py-5">
        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(owner) => owner.id}
          uppercaseHeaders
          bordered
          emptyMessage="No owners configured yet — add one to fill the asset form's Owner dropdown."
        />

        <Pagination
          className="mt-5"
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={owners.length}
          itemLabel="owners"
          variant={lastPage > 5 ? "numbered" : "prev-next"}
          onPageChange={setPage}
        />
      </Card>

      <p className="text-[13px] text-muted">
        A newly discovered asset has no owner until somebody assigns one — the
        Owner field defaults to blank, never to the first name on this list.
      </p>

      {dialog && (
        <AssetOwnerModal
          owner={dialog.owner}
          existing={directory}
          onClose={() => setDialog(null)}
          onSave={save}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Remove this owner?"
        description={`${pendingDelete?.name ?? "This owner"} will no longer be offered in the Owner dropdown. Assets already assigned to them keep the record until they are reassigned.`}
        confirmLabel="Remove Owner"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
