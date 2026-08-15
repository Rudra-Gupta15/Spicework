import { memo } from "react";

import logoUrl from "@/assets/img/Spiceworks logo.png";
import { cn } from "@/lib/cn";

type LogoSize = "sm" | "md" | "lg";

/**
 * `lockup` sizes the full artwork (mark + wordmark, 156×36 native);
 * `mark` sizes the mark-only crop used when the wordmark has to be
 * re-coloured for a light background.
 */
const SIZES: Record<
  LogoSize,
  { lockup: string; mark: string; text: string; gap: string }
> = {
  sm: { lockup: "h-7", mark: "h-7 w-7", text: "text-lg", gap: "gap-2" },
  md: { lockup: "h-9", mark: "h-8 w-8", text: "text-[22px]", gap: "gap-2.5" },
  lg: { lockup: "h-11", mark: "h-9 w-9", text: "text-[28px]", gap: "gap-3" },
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
 * Spiceworks logo, loaded from `src/assets/img/Spiceworks logo.png` —
 * replace that single file to swap the artwork everywhere.
 *
 * The artwork ships with a white wordmark, so it is used whole on dark
 * surfaces (sidebar, auth panel). On light surfaces — and in `compact`
 * mode — only the orange mark is shown, with the wordmark set in text.
 */
const LogoComponent = ({
  className,
  size = "md",
  variant = "light",
  compact = false,
}: LogoProps) => {
  const scale = SIZES[size];

  if (variant === "light" && !compact) {
    return (
      <img
        src={logoUrl}
        alt="Spiceworks"
        className={cn("w-auto shrink-0 object-contain", scale.lockup, className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center", scale.gap, className)}>
      {/* Mark-only crop: the wordmark starts past the 32px-wide mark. */}
      <span
        aria-hidden="true"
        className={cn("relative block shrink-0 overflow-hidden", scale.mark)}
      >
        <img
          src={logoUrl}
          alt=""
          className="absolute top-0 left-0 h-full max-w-none"
        />
      </span>

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
