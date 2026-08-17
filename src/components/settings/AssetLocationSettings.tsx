import { useMemo, useState } from "react";
import { MapPin, Plus, Search } from "lucide-react";

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
  ASSET_LOCATIONS,
  addLocation,
  removeLocation,
  scopeFilterOptions,
  scopeLabel,
  updateLocation,
} from "@/data/assetFields";
import type { AssetLocation, AssetLocationDraft } from "@/types/assetFields";

import { AssetLocationModal } from "./AssetLocationModal";
import { AssetScopeBadge } from "./AssetScopeBadge";

const PAGE_SIZE = 8;

/** Closed, adding (`location: null`) or editing a specific row. */
type LocationDialog = { location: AssetLocation | null } | null;

/**
 * The location list: where an asset can physically sit. Mirrors the owner
 * directory — same table, same scoping rules — because they are the same
 * kind of configurable dropdown behind the asset form.
 */
export const AssetLocationSettings = () => {
  const [list, setList] = useState<AssetLocation[]>(() => [...ASSET_LOCATIONS]);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState(ALL_SCOPES_LABEL);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<LocationDialog>(null);
  const [pendingDelete, setPendingDelete] = useState<AssetLocation | null>(null);

  const locations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return list.filter(
      (location) =>
        (scope === ALL_SCOPES_LABEL || scopeLabel(location) === scope) &&
        (term === "" ||
          `${location.name} ${location.description}`
            .toLowerCase()
            .includes(term)),
    );
  }, [list, search, scope]);

  const lastPage = Math.max(1, Math.ceil(locations.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const visible = useMemo(
    () =>
      locations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [locations, currentPage],
  );

  const save = (draft: AssetLocationDraft) => {
    const editing = dialog?.location;

    if (editing) {
      updateLocation(editing.id, draft);
      setList((current) =>
        current.map((entry) =>
          entry.id === editing.id ? { ...entry, ...draft } : entry,
        ),
      );
    } else {
      const location = addLocation(draft);
      setList((current) => [location, ...current]);
      setPage(1);
    }

    setDialog(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    removeLocation(pendingDelete.id);
    setList((current) => current.filter((entry) => entry.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  const columns: Column<AssetLocation>[] = useMemo(
    () => [
      {
        key: "location",
        header: "Location",
        render: (location) => (
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand"
            >
              <MapPin className="h-4 w-4" strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-heading">{location.name}</p>
              {location.description && (
                <p className="text-[13px] text-muted">{location.description}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "scope",
        header: "Availability",
        render: (location) => <AssetScopeBadge entry={location} />,
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (location) => (
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setDialog({ location })}
              className="font-semibold text-brand transition-colors hover:text-brand-600 focus-visible:outline-none"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(location)}
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
          placeholder="Search locations..."
          aria-label="Search locations"
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
          onClick={() => setDialog({ location: null })}
        >
          Add Location
        </Button>
      </Card>

      <Card className="px-5 py-5">
        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(location) => location.id}
          uppercaseHeaders
          bordered
          emptyMessage="No locations configured yet — add one to fill the asset form's Location dropdown."
        />

        <Pagination
          className="mt-5"
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={locations.length}
          itemLabel="locations"
          variant={lastPage > 5 ? "numbered" : "prev-next"}
          onPageChange={setPage}
        />
      </Card>

      <p className="text-[13px] text-muted">
        A newly discovered asset has no location until somebody sets one — the
        Location field defaults to blank.
      </p>

      {dialog && (
        <AssetLocationModal
          location={dialog.location}
          existing={list}
          onClose={() => setDialog(null)}
          onSave={save}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Remove this location?"
        description={`${pendingDelete?.name ?? "This location"} will no longer be offered in the Location dropdown. Assets already sitting there keep the record until they are moved.`}
        confirmLabel="Remove Location"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
