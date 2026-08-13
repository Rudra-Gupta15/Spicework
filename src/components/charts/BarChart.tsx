import { useMemo } from "react";

import { cn } from "@/lib/cn";
import type { BarPoint } from "@/types/dashboard";

/** Steps humans read as round: 1, 2, 2.5, 5, 10 at any magnitude. */
const NICE_MULTIPLES = [1, 2, 2.5, 5, 10];

/** Smallest "nice" step whose top gridline still clears the tallest bar. */
const niceStep = (peak: number, intervals: number): number => {
  const rough = peak / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(rough || 1));

  for (const multiple of NICE_MULTIPLES) {
    const step = multiple * magnitude;
    if (step * intervals >= peak) return step;
  }

  return 10 * magnitude;
};

interface BarChartProps {
  data: BarPoint[];
  /** Label above the y-axis, e.g. "Devices". */
  axisLabel?: string;
  /** Number of gridlines including zero. */
  tickCount?: number;
  /** Plot height in px (excludes axis labels). */
  height?: number;
  color?: string;
  /** Suffix shown in the hover tooltip, e.g. "devices". */
  unit?: string;
  className?: string;
}

/**
 * Single-series vertical bar chart — thin marks, rounded data-ends anchored
 * to the baseline, recessive gridlines, hover tooltip per bar.
 * No legend: the card title names the one series.
 */
export const BarChart = ({
  data,
  axisLabel,
  tickCount = 6,
  height = 200,
  color = "var(--color-chart-bar)",
  unit,
  className,
}: BarChartProps) => {
  const { max, ticks } = useMemo(() => {
    const intervals = Math.max(tickCount - 1, 1);
    const peak = Math.max(...data.map((point) => point.value), 0);
    const step = niceStep(peak, intervals);

    return {
      max: step * intervals,
      ticks: Array.from(
        { length: intervals + 1 },
        (_, index) => step * index,
      ).reverse(),
    };
  }, [data, tickCount]);

  return (
    <div className={cn("w-full", className)}>
      {axisLabel && <p className="mb-2 text-xs text-muted">{axisLabel}</p>}

      <div className="flex gap-3">
        {/* Y axis */}
        <div
          className="flex flex-col justify-between text-right text-xs text-muted tabular-nums"
          style={{ height }}
        >
          {ticks.map((tick) => (
            <span key={tick} className="leading-none">
              {tick.toLocaleString()}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div className="relative min-w-0 flex-1">
          <div
            className="absolute inset-x-0 top-0 flex flex-col justify-between"
            style={{ height }}
            aria-hidden="true"
          >
            {ticks.map((tick) => (
              <span key={tick} className="h-px w-full bg-line/70" />
            ))}
          </div>

          <div className="relative flex items-end gap-2" style={{ height }}>
            {data.map((point) => (
              <div
                key={point.label}
                className="group relative flex h-full flex-1 items-end justify-center"
              >
                <div
                  className="w-2 rounded-t-[4px] transition-opacity duration-150 group-hover:opacity-80"
                  style={{
                    height: `${(point.value / max) * 100}%`,
                    backgroundColor: color,
                  }}
                />

                {/* Hover tooltip */}
                <div
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg bg-heading px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block"
                >
                  <span className="font-semibold">
                    {point.value.toLocaleString()}
                  </span>
                  {unit && <span className="text-white/70"> {unit}</span>}
                  <span className="text-white/70"> · {point.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* X axis */}
          <div className="mt-3 flex gap-2">
            {data.map((point) => (
              <span
                key={point.label}
                className="flex-1 text-center text-xs whitespace-nowrap text-muted"
              >
                {point.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
