import { useState } from "react";

import { Button, Input, Modal } from "@/components/ui";
import type { SectionEditConfig } from "@/data/report";
import { ApiError } from "@/lib/api";
import type { ReportSection } from "@/types/report";

interface EditSectionRowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: ReportSection | undefined;
  config: SectionEditConfig | undefined;
  /** Only rows with at least one changed cell are included. */
  onSave: (updates: { rowKey: string; fields: Record<string, string> }[]) => Promise<unknown>;
}

/**
 * Corrects one or several rows of a list section — Disk Partitions, Network
 * Adapters, Peripherals, Printers, Video Controllers, User Accounts. One
 * form for all six, driven entirely by `config`: which columns are editable
 * and which one is each row's stable identity.
 *
 * A save is filed under the row's identity *as it stood when the dialog
 * opened*, even if that very column was one of the edits — the correction
 * has to keep matching the same real disk or adapter the next time the
 * agent scans, and that only works if the key does not move out from under
 * it in the same save that changes it.
 */
export const EditSectionRowsModal = ({
  isOpen,
  onClose,
  section,
  config,
  onSave,
}: EditSectionRowsModalProps) => {
  /* One draft cell per [row index, column]. Cleared and reseeded whenever a
     different section opens, the same render-time reset every other edit
     dialog in this app uses. */
  const [draft, setDraft] = useState<string[][]>(section?.rows ?? []);
  const [isSaving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const [openedFor, setOpenedFor] = useState(section?.id);
  if (isOpen && openedFor !== section?.id) {
    setOpenedFor(section?.id);
    setDraft(section?.rows ?? []);
    setFailure(null);
  }

  if (!section || !config) return null;

  const editableColumns = section.columns.filter((header) => header in config.fieldForColumn);
  const columnIndex = (header: string) => section.columns.indexOf(header);
  const keyColIndex = columnIndex(config.rowKeyColumn);

  const setCell = (rowIndex: number, colIndex: number, value: string) => {
    setDraft((current) => {
      const next = current.map((row) => [...row]);
      next[rowIndex][colIndex] = value;
      return next;
    });
    setFailure(null);
  };

  const changedUpdates = () => {
    const updates: { rowKey: string; fields: Record<string, string> }[] = [];

    draft.forEach((row, rowIndex) => {
      const original = section.rows[rowIndex];
      const fields: Record<string, string> = {};

      editableColumns.forEach((header) => {
        const colIndex = columnIndex(header);
        if (row[colIndex] !== original[colIndex]) {
          fields[config.fieldForColumn[header]] = row[colIndex];
        }
      });

      if (Object.keys(fields).length > 0) {
        updates.push({ rowKey: original[keyColIndex], fields });
      }
    });

    return updates;
  };

  const updates = changedUpdates();

  const handleSubmit = async () => {
    if (updates.length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setFailure(null);
    try {
      await onSave(updates);
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
      title={`Correct ${section.title}`}
      description="Fixes rows the agent misread. This updates the device's real record, so Hardware Detail and every future report show the correction too."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            isLoading={isSaving}
            disabled={updates.length === 0}
          >
            Save {updates.length > 0 ? `${updates.length} ${updates.length === 1 ? "row" : "rows"}` : ""}
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

        {draft.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Nothing in this section to correct.</p>
        ) : (
          <div className="scrollbar-slim-light -mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-line">
                  {editableColumns.map((header) => (
                    <th
                      key={header}
                      className="px-2 py-2 text-left text-xs font-semibold text-muted"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draft.map((row, rowIndex) => (
                  <tr key={section.rows[rowIndex][keyColIndex]} className="border-b border-line last:border-0">
                    {editableColumns.map((header) => {
                      const colIndex = columnIndex(header);
                      return (
                        <td key={header} className="px-2 py-2">
                          <Input
                            size="sm"
                            value={row[colIndex]}
                            onChange={(event) => setCell(rowIndex, colIndex, event.target.value)}
                            aria-label={`${header}, row ${rowIndex + 1}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
