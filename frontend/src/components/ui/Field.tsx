import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  /** Id of the control this label points at. */
  htmlFor?: string;
  /** Marks the label with the required asterisk. */
  required?: boolean;
  /** Validation message rendered under the control. */
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Form row with the label above the control — used by the long entry forms,
 * where labels read as sentences instead of the compact uppercase style
 * `Input` uses on its own.
 */
export const Field = ({
  label,
  htmlFor,
  required = false,
  error,
  className,
  children,
}: FieldProps) => (
  <div className={cn("w-full", className)}>
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[13px] font-semibold text-heading"
    >
      {label}
      {required && (
        <span className="ml-1 text-status-offline" aria-hidden="true">
          *
        </span>
      )}
    </label>

    {children}

    {error && <p className="mt-1.5 text-xs text-status-offline">{error}</p>}
  </div>
);
