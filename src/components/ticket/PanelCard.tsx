import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

interface PanelCardProps {
  /** Rendered in small caps above the body, e.g. "DESCRIPTION". */
  label: string;
  /** Optional glyph before the caption. */
  icon?: LucideIcon;
  /** Rules off the caption — used when the body is a long list. */
  divider?: boolean;
  className?: string;
  children: ReactNode;
}

/** Card with an uppercase caption — the panel style of the ticket screen. */
export const PanelCard = ({
  label,
  icon: Icon,
  divider = false,
  className,
  children,
}: PanelCardProps) => (
  <Card className={cn("px-5 py-4", className)}>
    <h2
      className={cn(
        "flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase",
        divider && "border-b border-line pb-3",
      )}
    >
      {Icon && (
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} aria-hidden="true" />
      )}
      {label}
    </h2>

    <div className="mt-3">{children}</div>
  </Card>
);
