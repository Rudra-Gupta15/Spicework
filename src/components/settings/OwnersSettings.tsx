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
  addOwner,
  removeOwner,
  updateOwner,
  useOwners,
  type OwnerOption,
} from "@/data/assetConfig";

interface Draft {
  name: string;
  email: string;
  scope: string;
}

const EMPTY: Draft = { name: "", email: "", scope: GLOBAL_SCOPE };

/**
 * Manage the configurable Owner list (Name + Email), each scoped Global or to a
 * specific organization. Feeds the Owner dropdown on the asset Lifecycle form.
 */
export const OwnersSettings = () => {
  const owners = useOwners();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OwnerOption | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [deleting, setDeleting] = useState<OwnerOption | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDraft(EMPTY);
    setFormOpen(true);
  };

  const openEdit = (owner: OwnerOption) => {
    setEditing(owner);
    setDraft({ name: owner.name, email: owner.email, scope: owner.scope });
    setFormOpen(true);
  };

  const canSubmit = draft.name.trim() !== "" && draft.email.trim() !== "";

  const submit = () => {
    if (!canSubmit) return;
    const payload = { name: draft.name.trim(), email: draft.email.trim(), scope: draft.scope };
    if (editing) updateOwner(editing.id, payload);
    else addOwner(payload);
    setFormOpen(false);
  };

  const columns: Column<OwnerOption>[] = [
    { key: "name", header: "Name", cellClassName: "font-semibold text-heading" },
    { key: "email", header: "Email", wrap: true, cellClassName: "break-all" },
    { key: "scope", header: "Scope" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (owner) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${owner.name}`}
            onClick={() => openEdit(owner)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-canvas hover:text-heading"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${owner.name}`}
            onClick={() => setDeleting(owner)}
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
          Define who can be assigned as an asset owner. New assets start with no owner.
        </p>
        <Button
          variant="brand"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
          onClick={openAdd}
        >
          Add Owner
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={owners}
        rowKey={(owner) => owner.id}
        bordered
        uppercaseHeaders
        emptyMessage="No owners configured yet."
      />

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Owner" : "Add Owner"}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={submit} disabled={!canSubmit}>
              {editing ? "Save" : "Add Owner"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" required>
            <Input
              size="sm"
              placeholder="e.g. Alex Rivera"
              value={draft.name}
              onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
            />
          </Field>
          <Field label="Email Address" required>
            <Input
              type="email"
              size="sm"
              placeholder="name@company.com"
              value={draft.email}
              onChange={(event) => setDraft((d) => ({ ...d, email: event.target.value }))}
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
        title="Delete this owner?"
        description={`"${deleting?.name}" will be removed from the owner list. Assets already assigned to them keep the value.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (deleting) removeOwner(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
};
