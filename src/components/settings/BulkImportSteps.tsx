import { Check } from "lucide-react";

import type { BulkImportStep } from "@/lib/bulkImport";
import { cn } from "@/lib/cn";

interface BulkImportStepsProps {
  /** The walk this dialog actually does — some data types skip "Select". */
  steps: readonly BulkImportStep[];
  active: BulkImportStep;
}

/**
 * Where the upload has got to. A bulk import is a job with a middle, not a
 * single click, so the dialog says up front how many stages there are and
 * which one is on screen — nobody should be wondering whether pressing
 * Continue is the thing that writes.
 */
export const BulkImportSteps = ({ steps, active }: BulkImportStepsProps) => {
  const current = steps.indexOf(active);

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {steps.map((step, index) => {
        const done = index < current;
        const here = index === current;

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                done && "bg-brand-50 text-brand-600",
                here && "bg-auth-panel text-white",
                !done && !here && "bg-canvas text-muted",
              )}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
            </span>

            <span
              className={cn(
                "text-[13px]",
                here ? "font-semibold text-heading" : "text-muted",
              )}
              aria-current={here ? "step" : undefined}
            >
              {step}
            </span>

            {index < steps.length - 1 && (
              <span aria-hidden="true" className="h-px w-5 bg-line" />
            )}
          </li>
        );
      })}
    </ol>
  );
};
