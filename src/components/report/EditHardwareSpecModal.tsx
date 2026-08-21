import { useState } from "react";

import { Button, Field, Input, Modal } from "@/components/ui";
import { ApiError } from "@/lib/api";

/** The six Hardware Specification fields a correction can touch. */
export interface HardwareSpecFields {
  cpu: string;
  ram: string;
  disk: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
}

const FIELD_META: { key: keyof HardwareSpecFields; label: string }[] = [
  { key: "cpu", label: "Processor (CPU)" },
  { key: "ram", label: "Memory (RAM)" },
  { key: "disk", label: "Disk" },
  { key: "serialNumber", label: "Serial Number" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "model", label: "Model" },
];

interface EditHardwareSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** What the section shows right now — prefills the form and is the
      baseline a field has to differ from to count as a correction. */
  current: HardwareSpecFields;
  /** Only the fields actually changed are included — see the component doc. */
  onSave: (overrides: Partial<HardwareSpecFields>) => Promise<unknown>;
}

/**
 * Corrects a misread Hardware Specification field. The fix is not cosmetic:
 * it is saved to Asset Metadata and applied wherever this device's hardware
 * fields are read — Hardware Detail, this report, and anywhere else built on
 * the same endpoint — the same precedence Asset Tag and Location already use
 * against the agent's own reading.
 *
 * Only fields actually typed into are sent. A field left as it opened is not
 * "corrected to its current value" — that would freeze it at today's reading
 * forever, silently hiding a real change the next scan reports (a RAM
 * upgrade, a swapped drive). Untouched fields keep following the agent.
 */
export const EditHardwareSpecModal = ({
  isOpen,
  onClose,
  current,
  onSave,
}: EditHardwareSpecModalProps) => {
  const [draft, setDraft] = useState<HardwareSpecFields>(current);
  const [isSaving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  /* Re-seed the draft from the section's live values each time the dialog
     opens, the same way the other edit dialogs in this app do. */
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setDraft(current);
      setFailure(null);
    }
  }

  const changedKeys = FIELD_META.map((field) => field.key).filter(
    (key) => draft[key].trim() !== current[key].trim(),
  );

  const handleSubmit = async () => {
    if (changedKeys.length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setFailure(null);
    try {
      const overrides: Partial<HardwareSpecFields> = {};
      changedKeys.forEach((key) => {
        overrides[key] = draft[key].trim();
      });
      await onSave(overrides);
      onClose();
    } catch (error) {
      setFailure(
        error instanceof ApiError
          ? error.message
          : "Could not save the correction. Check your connection and try again.",
      );
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Hardware Specification"
      description="Fixes a field the agent misread. This updates the device's real record, so Hardware Detail and every future report show the correction too."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            isLoading={isSaving}
            disabled={changedKeys.length === 0}
          >
            Save correction
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

        {FIELD_META.map(({ key, label }) => (
          <Field key={key} label={label} htmlFor={`spec-${key}`}>
            <Input
              id={`spec-${key}`}
              value={draft[key]}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, [key]: event.target.value }))
              }
            />
          </Field>
        ))}
      </div>
    </Modal>
  );
};
