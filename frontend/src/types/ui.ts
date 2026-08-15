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
  /** Makes the whole tile a link to the drill-down list. */
  to?: string;
  /** Makes the whole tile a button — for drilling into a list already on this
      page (e.g. clearing filters), where a route link wouldn't do anything. */
  onClick?: () => void;
  delta?: {
    value: string;
    direction: "up" | "down";
    /** `up` is not always good — an alert going up is bad. */
    isPositive: boolean;
  };
}
