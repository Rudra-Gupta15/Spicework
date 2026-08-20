import { DEVICE_CATEGORIES } from "@/data/deviceInventory";
import { cn } from "@/lib/cn";
import type { DeviceCategory } from "@/types/device";

interface DeviceTypeTabsProps {
  value: DeviceCategory;
  onChange: (category: DeviceCategory) => void;
}

/**
 * Underlined tab row that switches which kind of device the table lists.
 * Each tab carries its category's icon, so the row reads at a glance;
 * it scrolls sideways on a phone instead of wrapping under the actions.
 */
export const DeviceTypeTabs = ({ value, onChange }: DeviceTypeTabsProps) => (
  <div
    role="tablist"
    aria-label="Device type"
    className="scrollbar-slim-light -mb-px flex gap-7 overflow-x-auto"
  >
    {DEVICE_CATEGORIES.map(({ id, icon: Icon }) => {
      const isActive = id === value;

      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(id)}
          className={cn(
            "flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm whitespace-nowrap transition-colors",
            "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            isActive
              ? "border-brand font-semibold text-brand"
              : "border-transparent text-muted hover:text-heading",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {id}
        </button>
      );
    })}
  </div>
);
