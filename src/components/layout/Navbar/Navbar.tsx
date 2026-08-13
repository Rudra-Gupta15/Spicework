import type { ReactNode } from "react";

import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/cn";

interface NavbarProps {
  /** Overrides the title resolved from the navigation config. */
  title?: string;
  /** Overrides the subtitle resolved from the navigation config. */
  subtitle?: string;
  /** Right-aligned slot for page-level actions (buttons, filters, …). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Page header shown at the top of the content area.
 * Title/subtitle come from the navigation config by default, so a page
 * only passes props when it needs something custom.
 */
export const Navbar = ({
  title,
  subtitle,
  actions,
  className,
}: NavbarProps) => {
  const meta = usePageMeta();

  return (
    <header className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="truncate text-[30px] leading-tight font-bold text-heading">
          {title ?? meta.title}
        </h1>
        {(subtitle ?? meta.subtitle) && (
          <p className="mt-1 text-sm text-muted">{subtitle ?? meta.subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      )}
    </header>
  );
};
