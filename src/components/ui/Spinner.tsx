import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

const SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

export type SpinnerSize = keyof typeof SIZES;

/**
 * The one spinning indicator in the app. It carries no text of its own —
 * whatever renders it owns the label, so a screen reader hears the reason
 * for the wait rather than "loading" three times over.
 */
export const Spinner = ({
  size = "md",
  className,
}: {
  size?: SpinnerSize;
  className?: string;
}) => (
  <LoaderCircle
    aria-hidden="true"
    strokeWidth={2.2}
    className={cn("shrink-0 animate-spin text-brand", SIZES[size], className)}
  />
);
