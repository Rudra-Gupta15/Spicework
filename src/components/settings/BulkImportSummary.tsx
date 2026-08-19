import { CheckCircle2, Download } from "lucide-react";

import { Button, DataTable, type Column } from "@/components/ui";
import { rejectedRows } from "@/lib/bulkImport";
import { cn } from "@/lib/cn";
import type { ImportRow, ImportSummary as Summary } from "@/types/bulkImport";

import { BulkImportTile } from "./BulkImportTile";

interface BulkImportSummaryProps {
  noun: { one: string; many: string };
  summary: Summary;
  rows: readonly ImportRow[];
  columns: Column<ImportRow>[];
  /** True when the user stopped the run rather than letting it finish. */
  stopped: boolean;
  onDownloadErrors: () => void;
}

/**
 * Step four, once it has finished: what the file actually did, and what is
 * left to deal with. Every rejected row is listed with its reason and can be
 * downloaded in the template shape — fix the last column, delete it, and the
 * file goes straight back in.
 */
export const BulkImportSummary = ({
  noun,
  summary,
  rows,
  columns,
  stopped,
  onDownloadErrors,
}: BulkImportSummaryProps) => {
  const rejected = rejectedRows(rows);
  const written = summary.created + summary.updated;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border px-4 py-3",
          rejected.length === 0
            ? "border-status-online/30 bg-green-50"
            : "border-status-maintenance/30 bg-amber-50",
        )}
      >
        <CheckCircle2
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            rejected.length === 0
              ? "text-status-online"
              : "text-status-maintenance",
          )}
          strokeWidth={2}
          aria-hidden="true"
        />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading">
            {stopped
              ? "Import stopped"
              : rejected.length === 0
                ? "Import finished"
                : "Import finished with rows left over"}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            {written} of {summary.total}{" "}
            {summary.total === 1 ? "row" : "rows"} written
            {stopped && " before you stopped it"}.
            {rejected.length > 0 &&
              ` The ${rejected.length} below ${rejected.length === 1 ? "was" : "were"} left out — nothing about ${rejected.length === 1 ? "it" : "them"} was changed.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <BulkImportTile value={summary.created} label={`${noun.many} added`} tone="good" />
        <BulkImportTile value={summary.updated} label={`${noun.many} updated`} tone="good" />
        <BulkImportTile value={summary.invalid} label="Skipped by checks" tone="bad" />
        <BulkImportTile value={summary.failed} label="Failed to write" tone="bad" />
      </div>

      {rejected.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-heading">
              Rows that need another look
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
            rows={[...rejected]}
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
