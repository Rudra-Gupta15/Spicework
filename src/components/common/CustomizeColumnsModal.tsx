import { useCallback, useState } from "react";
import { Download } from "lucide-react";

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
  /**
   * Adds an Export button beside Apply. It applies the checked columns the
   * same way Apply does, and also hands them to this so the caller can write
   * a file with exactly that set — never the view from before this dialog
   * was opened. Omit to leave the dialog exactly as it was: Reset and Apply
   * only.
   */
  onExport?: (columns: Key[]) => void;
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
  onExport,
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

  /* Keep the registry's order rather than click order — both Apply and
     Export read the draft through this. */
  const orderedDraft = useCallback(
    () => columns.filter((column) => draft.includes(column.key)).map((column) => column.key),
    [columns, draft],
  );

  const handleApply = useCallback(() => {
    onApply(orderedDraft());
    onClose();
  }, [orderedDraft, onApply, onClose]);

  const handleExport = useCallback(() => {
    const ordered = orderedDraft();
    /* Applied first: the file and the table it came from should never
       disagree about which columns this view means. */
    onApply(ordered);
    onExport?.(ordered);
    onClose();
  }, [orderedDraft, onApply, onExport, onClose]);

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
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={draft.length === 0}
              leftIcon={<Download className="h-4 w-4" strokeWidth={2.2} />}
            >
              Export
            </Button>
          )}
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
