import { cn } from "@/lib/cn";

interface DetailTabsProps<T extends string> {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
  className?: string;
}

/**
 * Underlined tab bar for detail screens.
 * Scrolls horizontally on narrow viewports instead of wrapping.
 */
export const DetailTabs = <T extends string>({
  tabs,
  active,
  onChange,
  className,
}: DetailTabsProps<T>) => (
  <div className={cn("border-b border-line", className)}>
    <div role="tablist" className="-mb-px flex gap-7 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab === active;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={cn(
              "shrink-0 border-b-2 pb-3 text-sm whitespace-nowrap transition-colors",
              "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              isActive
                ? "border-brand font-semibold text-heading"
                : "border-transparent text-muted hover:text-heading",
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  </div>
);
