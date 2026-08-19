import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/cn";
import type { StatMetric } from "@/types/ui";

import { Card } from "./Card";

/** KPI tile: label, hero number and an optional period-over-period delta. */
export const StatCard = ({ metric }: { metric: StatMetric }) => {
  const { label, value, caption, icon: Icon, delta, to, onClick } = metric;
  const TrendIcon = delta?.direction === "up" ? TrendingUp : TrendingDown;

  const tile = (
    <Card
      className={cn(
        "h-full p-4.5",
        (to || onClick) && "transition-colors hover:border-brand",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-heading">{label}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <p className="text-[22px] leading-none font-bold text-heading tabular-nums">
          {value}
        </p>

        {delta && (
          <span
            className={cn(
              "mb-0.5 inline-flex items-center gap-1 text-xs font-semibold",
              delta.isPositive ? "text-status-online" : "text-status-offline",
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
            {delta.value}
          </span>
        )}
      </div>

      {caption && (
        <p
          className="mt-1.5 truncate text-[13px] font-medium text-muted"
          title={caption}
        >
          {caption}
        </p>
      )}
    </Card>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}: ${value}`}
        className="block w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {tile}
      </button>
    );
  }

  if (!to) return tile;

  return (
    <Link
      to={to}
      aria-label={`${label}: ${value}`}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {tile}
    </Link>
  );
};
