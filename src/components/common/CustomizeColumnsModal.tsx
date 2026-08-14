import { useCallback, useState } from "react";

import { Button, Checkbox, Modal } from "@/components/ui";

/** One entry of a table's column registry. */
export interface ColumnOption<Key extends string> {
  key: Key;
  label: string;
}

interface CustomizeColumnsModalProps<Key extends string> {
  isOpen: boolean;
  onClose: () => void;
  /** Every column the table can show, in display order. */
  columns: readonly ColumnOption<Key>[];
  /** Selection restored by the Reset button. */
  defaultColumns: Key[];
  /** Columns currently shown in the table. */
  value: Key[];
  onApply: (columns: Key[]) => void;
}

/**
 * Column picker shared by the inventory tables. Edits happen on a draft, so
 * closing without pressing Apply leaves the table untouched.
 */
export const CustomizeColumnsModal = <Key extends string>({
  isOpen,
  onClose,
  columns,
  defaultColumns,
  value,
  onApply,
}: CustomizeColumnsModalProps<Key>) => {
  const [draft, setDraft] = useState<Key[]>(value);

  /* Re-seed the draft from the live value each time the dialog opens. */
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setDraft(value);
  }

  const toggle = useCallback((key: Key, checked: boolean) => {
    setDraft((current) =>
      checked ? [...current, key] : current.filter((item) => item !== key),
    );
  }, []);

  const handleApply = useCallback(() => {
    /* Keep the registry's order rather than click order. */
    onApply(
      columns
        .filter((column) => draft.includes(column.key))
        .map((column) => column.key),
    );
    onClose();
  }, [columns, draft, onApply, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Columns"
      description="Select columns to display in the table"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDraft(defaultColumns)}
          >
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
      <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {columns.map((column) => (
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
