import { useState } from "react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { resolveScope, scopeLabel, scopeOptions } from "@/data/assetFields";
import type { FieldErrors } from "@/lib/validation";
import type { AssetLocation, AssetLocationDraft } from "@/types/assetFields";

interface AssetLocationModalProps {
  /** The row being edited, or null when adding a new one. */
  location: AssetLocation | null;
  /** The rest of the list — used to keep names unique within a scope. */
  existing: AssetLocation[];
  onClose: () => void;
  onSave: (draft: AssetLocationDraft) => void;
}

type LocationErrors = FieldErrors<{ name: string }>;

/** Add/edit dialog for the location list. */
export const AssetLocationModal = ({
  location,
  existing,
  onClose,
  onSave,
}: AssetLocationModalProps) => {
  const options = scopeOptions();

  const [name, setName] = useState(location?.name ?? "");
  const [description, setDescription] = useState(location?.description ?? "");
  const [scope, setScope] = useState(
    location ? scopeLabel(location) : (options[0] ?? ""),
  );
  const [errors, setErrors] = useState<LocationErrors>({});

  const submit = () => {
    const next: LocationErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) next.name = "Enter a location name.";
    else if (
      existing.some(
        (entry) =>
          entry.id !== location?.id &&
          entry.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    )
      next.name = "That location is already on the list.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      name: trimmedName,
      description: description.trim(),
      ...resolveScope(scope),
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={location ? "Edit Location" : "Add Location"}
      description="Locations appear in the asset form's Location dropdown, so an asset can be tracked to where it physically sits."
      variant="plain"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit}>
            {location ? "Save Location" : "Add Location"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="Location Name"
          htmlFor="location-name"
          required
          error={errors.name}
        >
          <Input
            id="location-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            placeholder="e.g. HQ Mumbai — 3rd Floor"
            error={errors.name}
          />
        </Field>

        <Field label="Description" htmlFor="location-description">
          <Input
            id="location-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional — building, floor or room detail"
          />
        </Field>

        <Field label="Availability" htmlFor="location-scope">
          <Select
            id="location-scope"
            size="lg"
            fullWidth
            options={options}
            value={scope}
            onChange={setScope}
            aria-label="Availability"
          />
          <p className="mt-1.5 text-[13px] text-muted">
            A global location can be picked on any organization's assets;
            restricting one keeps it off every other organization's list.
          </p>
        </Field>
      </div>
    </Modal>
  );
};
