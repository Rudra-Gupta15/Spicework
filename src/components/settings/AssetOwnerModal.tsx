import { useState } from "react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { resolveScope, scopeLabel, scopeOptions } from "@/data/assetFields";
import { isValidEmail, type FieldErrors } from "@/lib/validation";
import type { AssetOwner, AssetOwnerDraft } from "@/types/assetFields";

interface AssetOwnerModalProps {
  /** The row being edited, or null when adding a new one. */
  owner: AssetOwner | null;
  /** The rest of the directory — used to keep addresses unique. */
  existing: AssetOwner[];
  onClose: () => void;
  onSave: (draft: AssetOwnerDraft) => void;
}

type OwnerErrors = FieldErrors<{ name: string; email: string }>;

/**
 * Add/edit dialog for the owner directory. Mounted only while open, so the
 * add case always starts from an empty form and the edit case always opens
 * on the row's current values.
 */
export const AssetOwnerModal = ({
  owner,
  existing,
  onClose,
  onSave,
}: AssetOwnerModalProps) => {
  const options = scopeOptions();

  const [name, setName] = useState(owner?.name ?? "");
  const [email, setEmail] = useState(owner?.email ?? "");
  const [scope, setScope] = useState(
    owner ? scopeLabel(owner) : (options[0] ?? ""),
  );
  const [errors, setErrors] = useState<OwnerErrors>({});

  const submit = () => {
    const next: OwnerErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) next.name = "Enter the owner's name.";

    if (!trimmedEmail) next.email = "Enter an email address.";
    else if (!isValidEmail(trimmedEmail))
      next.email = "Enter a valid email address.";
    else if (
      existing.some(
        (entry) =>
          entry.id !== owner?.id &&
          entry.email.toLowerCase() === trimmedEmail.toLowerCase(),
      )
    )
      next.email = "That address is already on the owner list.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      name: trimmedName,
      email: trimmedEmail,
      ...resolveScope(scope),
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={owner ? "Edit Owner" : "Add Owner"}
      description="Owners appear in the asset form's Owner dropdown, so an asset can be made somebody's responsibility."
      variant="plain"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit}>
            {owner ? "Save Owner" : "Add Owner"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" htmlFor="owner-name" required error={errors.name}>
          <Input
            id="owner-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            placeholder="e.g. Priya Sharma"
            error={errors.name}
          />
        </Field>

        <Field
          label="Email Address"
          htmlFor="owner-email"
          required
          error={errors.email}
        >
          <Input
            id="owner-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="e.g. priya.sharma@prevoyancesolutions.com"
            error={errors.email}
          />
        </Field>

        <Field label="Availability" htmlFor="owner-scope">
          <Select
            id="owner-scope"
            size="lg"
            fullWidth
            options={options}
            value={scope}
            onChange={setScope}
            aria-label="Availability"
          />
          <p className="mt-1.5 text-[13px] text-muted">
            A global owner can be picked on any organization's assets;
            restricting one keeps them off every other organization's list.
          </p>
        </Field>
      </div>
    </Modal>
  );
};
