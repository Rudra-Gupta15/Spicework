import { useCallback, useState } from "react";

import { Button, Checkbox, Modal } from "@/components/ui";
import { DEFAULT_COLUMNS, HARDWARE_COLUMNS } from "@/data/hardware";
import type { HardwareColumnKey } from "@/types/hardware";

interface CustomizeColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Columns currently shown in the table. */
  value: HardwareColumnKey[];
  onApply: (columns: HardwareColumnKey[]) => void;
}

/**
 * Column picker for the inventory table. Edits happen on a draft, so closing
 * without pressing Apply leaves the table untouched.
 */
export const CustomizeColumnsModal = ({
  isOpen,
  onClose,
  value,
  onApply,
}: CustomizeColumnsModalProps) => {
  const [draft, setDraft] = useState<HardwareColumnKey[]>(value);

  /* Re-seed the draft from the live value each time the dialog opens. */
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setDraft(value);
  }

  const toggle = useCallback((key: HardwareColumnKey, checked: boolean) => {
    setDraft((current) =>
      checked ? [...current, key] : current.filter((item) => item !== key),
    );
  }, []);

  const handleApply = useCallback(() => {
    /* Keep the registry's order rather than click order. */
    onApply(
      HARDWARE_COLUMNS.filter((column) => draft.includes(column.key)).map(
        (column) => column.key,
      ),
    );
    onClose();
  }, [draft, onApply, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Columns"
      description="Select columns to display in the table"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setDraft(DEFAULT_COLUMNS)}>
            Reset
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={handleApply}
            disabled={draft.length === 0}
          >
            Apply
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {HARDWARE_COLUMNS.map((column) => (
          <Checkbox
            key={column.key}
            variant="row"
            label={column.label}
            checked={draft.includes(column.key)}
            onChange={(checked) => toggle(column.key, checked)}
          />
        ))}
      </div>
    </Modal>
  );
};
