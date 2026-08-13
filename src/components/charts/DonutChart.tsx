import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { Segment } from "@/types/dashboard";

interface DonutChartProps {
  segments: Segment[];
  /** Diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  thickness?: number;
  /** Surface gap between segments in px (0 for a single continuous arc). */
  gap?: number;
  /** Rounds the ends — use for a single-value gauge. */
  rounded?: boolean;
  /** Overrides the denominator, e.g. a 0–100 gauge with one segment. */
  total?: number;
  /** Centre content (hero number + caption). */
  children?: ReactNode;
  className?: string;
}

/**
 * Donut / gauge drawn with a single SVG circle per segment using
 * stroke-dasharray — no charting dependency.
 */
export const DonutChart = ({
  segments,
  size = 160,
  thickness = 16,
  gap = 2,
  rounded = false,
  total,
  children,
  className,
}: DonutChartProps) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const sum = total ?? segments.reduce((acc, item) => acc + item.value, 0);

  /* Pre-compute each arc's length and start offset (no mutation mid-render). */
  const arcs = segments.reduce<
    { segment: Segment; length: number; offset: number }[]
  >((acc, segment) => {
    const previous = acc.at(-1);
    const start = previous ? previous.offset + previous.length + gap : 0;
    const share = sum > 0 ? segment.value / sum : 0;

    return [
      ...acc,
      {
        segment,
        length: Math.max(share * circumference - gap, 0),
        offset: start,
      },
    ];
  }, []);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={segments
          .map((segment) => `${segment.label}: ${segment.value}`)
          .join(", ")}
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={thickness}
          />

          {arcs.map(({ segment, length, offset }) => (
            <circle
              key={segment.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeLinecap={rounded ? "round" : "butt"}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
            />
          ))}
        </g>
      </svg>

      {children && (
        <div className="absolute inset-0 grid place-items-center text-center">
          {children}
        </div>
      )}
    </div>
  );
};
