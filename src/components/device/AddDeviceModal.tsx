import { useState } from "react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { DEVICE_CATEGORIES } from "@/data/deviceInventory";
import { ApiError } from "@/lib/api";
import type { DeviceCategory, DeviceDraft } from "@/types/device";

const CATEGORY_OPTIONS = DEVICE_CATEGORIES.map((category) => category.id);

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The tab that was open — what the form starts on. */
  category: DeviceCategory;
  /** Serials already registered, lower-cased; a repeat is caught here first. */
  takenSerials: string[];
  /** Saves the unit. Rejects if the server refused, leaving the form open. */
  onAdd: (draft: DeviceDraft) => Promise<unknown>;
}

const emptyDraft = (category: DeviceCategory): DeviceDraft => ({
  category,
  name: "",
  serialNumber: "",
  buyDate: "",
  currentUser: "",
});

/** Registers one unit. The serial is the identity, so it has to be unique. */
export const AddDeviceModal = ({
  isOpen,
  onClose,
  category,
  takenSerials,
  onAdd,
}: AddDeviceModalProps) => {
  const [draft, setDraft] = useState<DeviceDraft>(() => emptyDraft(category));
  const [errors, setErrors] = useState<Partial<Record<keyof DeviceDraft, string>>>(
    {},
  );
  const [isSaving, setSaving] = useState(false);
  /* A refusal from the server that isn't about one field — the connection
     dropped, the session expired. Shown above the form. */
  const [failure, setFailure] = useState<string | null>(null);

  /* Reopening the dialog starts a fresh entry, on whichever tab is now open
     rather than the one it was last used from. Derived during render rather
     than in an effect, so the empty form is what first paints. */
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setDraft(emptyDraft(category));
      setErrors({});
      setFailure(null);
      setSaving(false);
    }
  }

  const set = (patch: Partial<DeviceDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setFailure(null);
  };

  const handleSubmit = async () => {
    const name = draft.name.trim();
    const serialNumber = draft.serialNumber.trim();
    const next: Partial<Record<keyof DeviceDraft, string>> = {};

    if (!name) next.name = "Give the device a name.";
    if (!serialNumber) next.serialNumber = "A serial number is required.";
    else if (takenSerials.includes(serialNumber.toLowerCase()))
      next.serialNumber = "That serial is already registered.";
    if (!draft.buyDate) next.buyDate = "Pick the date it was bought.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setFailure(null);
    try {
      await onAdd({
        ...draft,
        name,
        serialNumber,
        currentUser: draft.currentUser.trim(),
      });
    } catch (error) {
      /* The database has the last word on uniqueness — another tab could have
         registered this serial since this form was opened, and that check is
         about the serial field specifically. */
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ serialNumber: error.message });
      } else {
        setFailure(
          error instanceof ApiError
            ? error.message
            : "Could not save the device. Check your connection and try again.",
        );
      }
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add device"
      description="Register a unit so it shows up in the inventory and can be assigned."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            Add device
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {failure && (
          <p
            role="alert"
            className="rounded-md border border-status-offline/30 bg-red-50 px-3 py-2 text-sm text-status-offline"
          >
            {failure}
          </p>
        )}

        <Field label="Device type" required>
          <Select
            options={CATEGORY_OPTIONS}
            value={draft.category}
            fullWidth
            onChange={(value) => set({ category: value as DeviceCategory })}
          />
        </Field>

        <Field label="Device name" htmlFor="device-name" required error={errors.name}>
          <Input
            id="device-name"
            value={draft.name}
            onChange={(event) => set({ name: event.target.value })}
            placeholder="Dell Latitude 5420"
          />
        </Field>

        <Field
          label="Serial number"
          htmlFor="device-serial"
          required
          error={errors.serialNumber}
        >
          <Input
            id="device-serial"
            value={draft.serialNumber}
            onChange={(event) => set({ serialNumber: event.target.value })}
            placeholder="SN-DL5420-3891"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Buy date"
            htmlFor="device-buy-date"
            required
            error={errors.buyDate}
          >
            <Input
              id="device-buy-date"
              type="date"
              value={draft.buyDate}
              onChange={(event) => set({ buyDate: event.target.value })}
            />
          </Field>

          <Field label="Assign to" htmlFor="device-user">
            <Input
              id="device-user"
              value={draft.currentUser}
              onChange={(event) => set({ currentUser: event.target.value })}
              placeholder="Leave empty to keep in store"
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
};
