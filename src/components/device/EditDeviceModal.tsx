import { useState } from "react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import {
  DEVICE_CATEGORIES,
  categoryTracksAssignment,
  needsAdoption,
} from "@/data/deviceInventory";
import { ApiError } from "@/lib/api";
import type { DeviceCategory, DeviceDraft, DeviceRecord } from "@/types/device";

const CATEGORY_OPTIONS = DEVICE_CATEGORIES.map((category) => category.id);

interface EditDeviceModalProps {
  /** The row being edited; `null` keeps the dialog closed. */
  device: DeviceRecord | null;
  onClose: () => void;
  /** Serials already registered, lower-cased, minus this row's own. */
  takenSerials: string[];
  /** Saves the row. Rejects if the server refused, leaving the form open. */
  onSave: (draft: DeviceDraft) => Promise<unknown>;
}

const draftFrom = (device: DeviceRecord): DeviceDraft => ({
  category: device.category,
  name: device.name,
  serialNumber: device.serialNumber,
  buyDate: device.buyDate,
  currentUser: device.currentUser,
});

/**
 * Edits an already-registered unit, or — for a row read live off the audited
 * fleet, or one of the sample rows a tab shows before anything real is in it
 * — adopts it into the registry for the first time. The two cases share one
 * form because they collect the same fields; which one actually happens on
 * save is the caller's call, made from whether the row is a real registered
 * device (see `needsAdoption`).
 *
 * "Assign to" only appears while adopting a category that tracks a holder at
 * all — see `categoryTracksAssignment`. Once a row is a real registered
 * device, who holds it is a hand-off history (`assignDevice`/`returnDevice`),
 * not a field this form is allowed to silently overwrite.
 */
export const EditDeviceModal = ({
  device,
  onClose,
  takenSerials,
  onSave,
}: EditDeviceModalProps) => {
  const [draft, setDraft] = useState<DeviceDraft>(() =>
    device ? draftFrom(device) : draftFrom({} as DeviceRecord),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof DeviceDraft, string>>>(
    {},
  );
  const [isSaving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  /* Opening a different row resets the form to that row's own values, the
     same way the Add dialog resets itself on open — derived during render so
     the previous row's edits never flash before this one's do. */
  const [loadedId, setLoadedId] = useState(device?.id);
  if (device && loadedId !== device.id) {
    setLoadedId(device.id);
    setDraft(draftFrom(device));
    setErrors({});
    setFailure(null);
    setSaving(false);
  }

  const adopting = device ? needsAdoption(device) : false;
  const showAssignField = adopting && categoryTracksAssignment(draft.category);

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

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setFailure(null);
    try {
      await onSave({
        ...draft,
        name,
        serialNumber,
        /* Never sent for a category that doesn't track a holder, even if the
           row being adopted came in with one pre-filled — the field is
           hidden precisely so nothing here can create an assignment nobody
           asked for. */
        currentUser: showAssignField ? draft.currentUser.trim() : "",
      });
    } catch (error) {
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
      isOpen={device !== null}
      onClose={onClose}
      title={adopting ? "Add to registry" : "Edit device"}
      description={
        adopting
          ? "Nothing here is in your registry yet — saving adds it as a real unit you can rename, date and edit from here on."
          : "Changes apply to this unit's record. Reassigning it is done from View History."
      }
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} isLoading={isSaving}>
            {adopting ? "Add to registry" : "Save changes"}
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

        <Field label="Device name" htmlFor="edit-device-name" required error={errors.name}>
          <Input
            id="edit-device-name"
            value={draft.name}
            onChange={(event) => set({ name: event.target.value })}
          />
        </Field>

        <Field
          label="Serial number"
          htmlFor="edit-device-serial"
          required
          error={errors.serialNumber}
        >
          <Input
            id="edit-device-serial"
            value={draft.serialNumber}
            onChange={(event) => set({ serialNumber: event.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Buy date" htmlFor="edit-device-buy-date">
            <Input
              id="edit-device-buy-date"
              type="date"
              value={draft.buyDate}
              onChange={(event) => set({ buyDate: event.target.value })}
            />
          </Field>

          {showAssignField && (
            <Field label="Assign to" htmlFor="edit-device-user">
              <Input
                id="edit-device-user"
                value={draft.currentUser}
                onChange={(event) => set({ currentUser: event.target.value })}
                placeholder="Leave empty to keep in store"
              />
            </Field>
          )}
        </div>
      </div>
    </Modal>
  );
};
