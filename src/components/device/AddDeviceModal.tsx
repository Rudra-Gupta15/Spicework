import { useState } from "react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { DEVICE_CATEGORIES } from "@/data/deviceInventory";
import type { DeviceCategory, DeviceDraft } from "@/types/device";

const CATEGORY_OPTIONS = DEVICE_CATEGORIES.map((category) => category.id);

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The tab that was open — what the form starts on. */
  category: DeviceCategory;
  /** Serials already registered, lower-cased; a repeat is rejected here. */
  takenSerials: string[];
  onAdd: (draft: DeviceDraft) => void;
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

  /* Reopening the dialog starts a fresh entry, on whichever tab is now open
     rather than the one it was last used from. Derived during render rather
     than in an effect, so the empty form is what first paints. */
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setDraft(emptyDraft(category));
      setErrors({});
    }
  }

  const set = (patch: Partial<DeviceDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const handleSubmit = () => {
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

    onAdd({
      ...draft,
      name,
      serialNumber,
      currentUser: draft.currentUser.trim(),
    });
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add device</Button>
        </>
      }
    >
      <div className="space-y-4">
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
