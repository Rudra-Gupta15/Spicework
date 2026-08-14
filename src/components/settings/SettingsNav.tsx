import { cn } from "@/lib/cn";
import { SETTINGS_CATEGORIES, type SettingsCategory } from "@/data/settings";

interface SettingsNavProps {
  active: SettingsCategory;
  onChange: (category: SettingsCategory) => void;
}

/** Vertical category list down the left of the settings screen. */
export const SettingsNav = ({ active, onChange }: SettingsNavProps) => (
  <nav className="w-full lg:w-[220px] lg:shrink-0 lg:border-r lg:border-line lg:pr-4">
    <p className="mb-3 px-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
      Settings Categories
    </p>

    <ul className="space-y-1">
      {SETTINGS_CATEGORIES.map((category) => {
        const isActive = category === active;

        return (
          <li key={category}>
            <button
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onChange(category)}
              className={cn(
                "w-full rounded-lg border-l-2 px-3 py-2.5 text-left text-sm transition-colors",
                "focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none",
                isActive
                  ? "border-brand bg-brand-50 font-semibold text-brand-600"
                  : "border-transparent text-muted hover:bg-canvas hover:text-heading",
              )}
            >
              {category}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
