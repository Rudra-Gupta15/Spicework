import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/cn";
import type { StatMetric, Tone } from "@/types/ui";

import { Card } from "./Card";

const ICON_TONES: Record<Tone, string> = {
  info: "bg-blue-50 text-status-info",
  success: "bg-green-50 text-status-online",
  danger: "bg-red-50 text-status-offline",
  warning: "bg-amber-50 text-status-maintenance",
  brand: "bg-brand-50 text-brand-600",
  neutral: "bg-canvas text-muted",
};

/** KPI tile: label, hero number and an optional period-over-period delta. */
export const StatCard = ({ metric }: { metric: StatMetric }) => {
  const { label, value, icon: Icon, tone, delta } = metric;
  const TrendIcon = delta?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <Card className="p-[18px]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-heading">{label}</p>
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
            ICON_TONES[tone],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <p className="text-[30px] leading-none font-bold text-heading tabular-nums">
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
    </Card>
  );
};
