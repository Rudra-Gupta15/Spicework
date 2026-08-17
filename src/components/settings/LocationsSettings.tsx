import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  Select,
  type Column,
} from "@/components/ui";
import {
  GLOBAL_SCOPE,
  SCOPE_OPTIONS,
  addLocation,
  removeLocation,
  updateLocation,
  useLocations,
  type LocationOption,
} from "@/data/assetConfig";

interface Draft {
  name: string;
  scope: string;
}

const EMPTY: Draft = { name: "", scope: GLOBAL_SCOPE };

/**
 * Manage the configurable Location list, each scoped Global or to a specific
 * organization. Feeds the Location dropdown on the asset Lifecycle form.
 */
export const LocationsSettings = () => {
  const locations = useLocations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LocationOption | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [deleting, setDeleting] = useState<LocationOption | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDraft(EMPTY);
    setFormOpen(true);
  };

  const openEdit = (location: LocationOption) => {
    setEditing(location);
    setDraft({ name: location.name, scope: location.scope });
    setFormOpen(true);
  };

  const canSubmit = draft.name.trim() !== "";

  const submit = () => {
    if (!canSubmit) return;
    const payload = { name: draft.name.trim(), scope: draft.scope };
    if (editing) updateLocation(editing.id, payload);
    else addLocation(payload);
    setFormOpen(false);
  };

  const columns: Column<LocationOption>[] = [
    { key: "name", header: "Location", cellClassName: "font-semibold text-heading" },
    { key: "scope", header: "Scope" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (location) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${location.name}`}
            onClick={() => openEdit(location)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-canvas hover:text-heading"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${location.name}`}
            onClick={() => setDeleting(location)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-status-offline"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Define the physical locations an asset can be assigned to. New assets start with no location.
        </p>
        <Button
          variant="brand"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
          onClick={openAdd}
        >
          Add Location
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={locations}
        rowKey={(location) => location.id}
        bordered
        uppercaseHeaders
        emptyMessage="No locations configured yet."
      />

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Location" : "Add Location"}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={submit} disabled={!canSubmit}>
              {editing ? "Save" : "Add Location"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Location Name" required>
            <Input
              size="sm"
              placeholder="e.g. Head Office — Server Room"
              value={draft.name}
              onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
            />
          </Field>
          <Field label="Scope">
            <Select
              fullWidth
              options={SCOPE_OPTIONS}
              value={draft.scope}
              onChange={(scope) => setDraft((d) => ({ ...d, scope }))}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete this location?"
        description={`"${deleting?.name}" will be removed from the location list. Assets already assigned to it keep the value.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (deleting) removeLocation(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
};
