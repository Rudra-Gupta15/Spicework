import { cn } from "@/lib/cn";

const BAR_HEIGHTS = ["h-1.5", "h-2.5", "h-3.5", "h-[18px]"];

interface SignalBarsProps {
  /** Filled bars, 1 to 4. */
  strength: number;
  className?: string;
}

/** Four-step signal meter — filled bars are emerald, the rest stay grey. */
export const SignalBars = ({ strength, className }: SignalBarsProps) => (
  <span
    role="img"
    aria-label={`Signal strength ${strength} of 4`}
    className={cn("flex items-end gap-[3px]", className)}
  >
    {BAR_HEIGHTS.map((height, index) => (
      <span
        key={height}
        className={cn(
          "w-[3px] rounded-[1px]",
          height,
          index < strength ? "bg-signal-500" : "bg-navy-200",
        )}
      />
    ))}
  </span>
);
