import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  /** Any CSS colour — defaults to the single-series chart hue. */
  color?: string;
  className?: string;
  trackClassName?: string;
  label?: string;
}

export const ProgressBar = ({
  value,
  color = "var(--color-chart-bar)",
  className,
  trackClassName,
  label,
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-line",
        trackClassName,
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
};
