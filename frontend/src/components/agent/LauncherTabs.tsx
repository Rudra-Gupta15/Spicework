import { cn } from "@/lib/cn";
import { LAUNCHERS } from "@/data/agent";
import type { LauncherId } from "@/types/agent";

interface LauncherTabsProps {
  value: LauncherId;
  onChange: (id: LauncherId) => void;
}

/** Pill row for choosing which double-clickable launcher to download. */
export const LauncherTabs = ({ value, onChange }: LauncherTabsProps) => (
  <div className="flex flex-wrap gap-2.5">
    {LAUNCHERS.map((launcher) => {
      const isActive = launcher.id === value;

      return (
        <button
          key={launcher.id}
          type="button"
          aria-pressed={isActive}
          onClick={() => onChange(launcher.id)}
          className={cn(
            "rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors",
            "focus-visible:ring-2 focus-visible:ring-auth-panel/30 focus-visible:outline-none",
            isActive
              ? "border-auth-panel bg-auth-panel text-white"
              : "border-line bg-surface text-heading hover:bg-canvas",
          )}
        >
          {launcher.label}
        </button>
      );
    })}
  </div>
);
