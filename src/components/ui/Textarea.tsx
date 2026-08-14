import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Validation state — matches the red border `Input` uses. */
  error?: boolean;
}

/** Multi-line field styled to match `Input`. */
export const Textarea = ({
  error = false,
  rows = 4,
  className,
  ...props
}: TextareaProps) => (
  <textarea
    rows={rows}
    aria-invalid={error ? true : undefined}
    className={cn(
      "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-[15px] text-heading",
      "placeholder:text-navy-300 transition-colors duration-150",
      "focus:ring-2 focus:outline-none",
      error
        ? "border-status-offline focus:border-status-offline focus:ring-status-offline/20"
        : "border-field focus:border-auth-panel focus:ring-auth-panel/15",
      className,
    )}
    {...props}
  />
);
