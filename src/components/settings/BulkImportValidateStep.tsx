import { AlertTriangle, CheckCircle2, Download } from "lucide-react";

import { Button, DataTable, type Column } from "@/components/ui";
import type { ImportRow } from "@/types/bulkImport";

import { BulkImportTile } from "./BulkImportTile";

/** How many distinct complaints are listed before the rest are counted off. */
const REASON_LIMIT = 6;

interface BulkImportValidateStepProps {
  noun: { one: string; many: string };
  rows: readonly ImportRow[];
  /** How the table identifies a row — the same columns the preview uses. */
  columns: Column<ImportRow>[];
  onDownloadErrors: () => void;
}

/**
 * Step three: what the checks made of the file, before anything is written.
 * Complaints are counted by reason rather than listed one by one — twenty
 * rows failing for the same missing column is one thing to fix, and reading
 * it twenty times does not make it clearer.
 */
export const BulkImportValidateStep = ({
  noun,
  rows,
  columns,
  onDownloadErrors,
}: BulkImportValidateStepProps) => {
  const ready = rows.filter((row) => row.state === "ready");
  const invalid = rows.filter((row) => row.state === "invalid");

  const creating = ready.filter((row) => row.action === "create").length;
  const updating = ready.length - creating;

  const reasons = invalid.reduce((counts, row) => {
    const reason = row.error ?? "Refused.";
    return counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }, new Map<string, number>());

  const ranked = [...reasons.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <BulkImportTile value={rows.length} label="Rows read" tone="plain" />
        <BulkImportTile value={creating} label={`${noun.many} to add`} tone="good" />
        <BulkImportTile value={updating} label={`${noun.many} to update`} tone="good" />
        <BulkImportTile value={invalid.length} label="Rows with problems" tone="bad" />
      </div>

      {invalid.length === 0 ? (
        <p className="flex items-start gap-3 rounded-lg border border-status-online/30 bg-green-50 px-4 py-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-status-online"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="min-w-0 text-[13px] text-heading">
            Every row passed. Nothing has been written yet — the next step shows
            what each one will do.
          </span>
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-status-maintenance/30 bg-amber-50 px-4 py-3">
            <p className="flex items-start gap-2 text-sm font-semibold text-heading">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-status-maintenance"
                strokeWidth={2}
                aria-hidden="true"
              />
              {invalid.length} {invalid.length === 1 ? "row" : "rows"} cannot be
              imported
            </p>

            <ul className="mt-2 space-y-1 text-[13px] text-heading">
              {ranked.slice(0, REASON_LIMIT).map(([reason, count]) => (
                <li key={reason} className="flex gap-2">
                  <span className="font-semibold tabular-nums">{count}×</span>
                  <span className="min-w-0 text-muted">{reason}</span>
                </li>
              ))}
            </ul>

            {ranked.length > REASON_LIMIT && (
              <p className="mt-1.5 text-[11px] text-muted">
                and {ranked.length - REASON_LIMIT} other{" "}
                {ranked.length - REASON_LIMIT === 1 ? "reason" : "reasons"}.
              </p>
            )}

            <p className="mt-2 text-[13px] text-muted">
              Carrying on imports the {ready.length} that passed and leaves
              these behind — or fix them now and upload the file again.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-heading">
              Rows with problems
            </p>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" strokeWidth={2.1} />}
              onClick={onDownloadErrors}
            >
              Download error report
            </Button>
          </div>

          <DataTable
            columns={columns}
            rows={invalid}
            rowKey={(row) => String(row.line)}
            uppercaseHeaders
            bordered
            dense
          />
        </>
      )}
    </div>
  );
};
