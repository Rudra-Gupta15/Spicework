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
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-3",
        className,
      )}
    >
      {/* The basis is the width the title asks for before the actions are
          pushed onto their own line — on a phone they always are. */}
      <div className="min-w-0 flex-1 basis-64">
        <h1 className="text-[22px] leading-tight font-bold break-words text-heading sm:text-[26px] lg:text-[30px]">
          {title ?? meta.title}
        </h1>
        {(subtitle ?? meta.subtitle) && (
          <p className="mt-1 text-sm text-muted">{subtitle ?? meta.subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          {actions}
        </div>
      )}
    </header>
  );
};
