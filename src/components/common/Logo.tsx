import { memo } from "react";

import markUrl from "@/assets/spiceworks-mark.svg";
import { cn } from "@/lib/cn";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { mark: string; text: string; gap: string }> = {
  sm: { mark: "h-7 w-7", text: "text-lg", gap: "gap-2" },
  md: { mark: "h-8 w-8", text: "text-[22px]", gap: "gap-2.5" },
  lg: { mark: "h-9 w-9", text: "text-[28px]", gap: "gap-3" },
};

interface LogoProps {
  className?: string;
  size?: LogoSize;
  /** Wordmark colour — `light` for dark backgrounds, `dark` for light ones. */
  variant?: "light" | "dark";
  /** Hide the wordmark and render only the mark. */
  compact?: boolean;
}

/**
 * Spiceworks mark + wordmark.
 * The mark is loaded from `src/assets/spiceworks-mark.svg` — replace that
 * single file to swap in the official artwork everywhere.
 */
const LogoComponent = ({
  className,
  size = "md",
  variant = "light",
  compact = false,
}: LogoProps) => {
  const scale = SIZES[size];

  return (
    <div className={cn("flex items-center", scale.gap, className)}>
      <img
        src={markUrl}
        alt=""
        aria-hidden="true"
        className={cn("shrink-0 object-contain", scale.mark)}
      />

      {!compact && (
        <span
          className={cn(
            "leading-none font-semibold tracking-tight",
            scale.text,
            variant === "light" ? "text-white" : "text-heading",
          )}
        >
          spiceworks
        </span>
      )}
    </div>
  );
};

export const Logo = memo(LogoComponent);
