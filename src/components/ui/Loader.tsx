import { cn } from "@/lib/cn";

import { Spinner, type SpinnerSize } from "./Spinner";

interface LoaderProps {
  /** What is being waited on, e.g. "Loading device inventory…". */
  label?: string;
  size?: SpinnerSize;
  /**
   * `block` fills the panel the data will land in and centres itself;
   * `inline` sits on one line inside surrounding content.
   */
  variant?: "block" | "inline";
  className?: string;
}

/**
 * The app's single "waiting on the API" placeholder. Every panel that swaps
 * in fetched data renders this in the meantime, so a slow backend reads the
 * same on every screen instead of a different bare sentence per page.
 */
export const Loader = ({
  label = "Loading…",
  size,
  variant = "block",
  className,
}: LoaderProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      variant === "block"
        ? "flex flex-col items-center justify-center gap-3 py-10"
        : "flex items-center gap-2",
      className,
    )}
  >
    <Spinner size={size ?? (variant === "block" ? "md" : "sm")} />
    <span
      className={cn(
        "text-muted",
        variant === "block" ? "text-sm" : "text-[13px]",
      )}
    >
      {label}
    </span>
  </div>
);
