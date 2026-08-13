import type { LucideIcon } from "lucide-react";

/** Semantic colour intent shared by badges, stat tiles and icons. */
export type Tone =
  | "info"
  | "success"
  | "danger"
  | "warning"
  | "brand"
  | "neutral";

/** KPI tile shown in the top row of a page. */
export interface StatMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  tone: Tone;
  delta?: {
    value: string;
    direction: "up" | "down";
    /** `up` is not always good — an alert going up is bad. */
    isPositive: boolean;
  };
}
