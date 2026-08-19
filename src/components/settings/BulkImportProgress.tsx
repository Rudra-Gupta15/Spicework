import { ProgressBar } from "@/components/ui";

interface BulkImportProgressProps {
  noun: { one: string; many: string };
  processed: number;
  total: number;
}

/**
 * Step four, while it is happening. The rows are committed a few at a time
 * rather than in one blocking pass, so the dialog can say where it has got
 * to and stay closable — a file of a thousand assets is a job to watch, not
 * a frozen tab.
 */
export const BulkImportProgress = ({
  noun,
  processed,
  total,
}: BulkImportProgressProps) => {
  const percent = total === 0 ? 100 : (processed / total) * 100;

  return (
    <div className="space-y-4 py-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-heading">
          Importing {total} {total === 1 ? noun.one.toLowerCase() : noun.many.toLowerCase()}…
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {processed} of {total} done. You can stop this at any point — whatever
          has been written stays written.
        </p>
      </div>

      <ProgressBar
        value={percent}
        color="var(--color-brand)"
        label="Import progress"
        className="h-2"
      />

      <p className="text-center text-[11px] text-muted tabular-nums">
        {Math.round(percent)}%
      </p>
    </div>
  );
};
