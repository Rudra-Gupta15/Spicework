import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { Tone } from "@/types/ui";

const TONES: Record<Tone, string> = {
  info: "bg-blue-50 text-status-info",
  success: "bg-green-50 text-status-online",
  danger: "bg-red-50 text-status-offline",
  warning: "bg-amber-50 text-status-maintenance",
  brand: "bg-brand-50 text-brand-600",
  neutral: "bg-canvas text-muted",
};

interface BadgeProps {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}

/** Small status pill — always carries a label, never colour alone. */
export const Badge = ({ tone = "neutral", className, children }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold",
      TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);
