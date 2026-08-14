import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

interface DeviceInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Muted line under the value, e.g. a team or status detail. */
  detail?: string;
  /** `success` tints the icon and value green — used by the status tile. */
  tone?: "neutral" | "success";
}

/** One of the four summary tiles at the top of the device overview. */
export const DeviceInfoCard = ({
  icon: Icon,
  label,
  value,
  detail,
  tone = "neutral",
}: DeviceInfoCardProps) => (
  <Card className="p-5">
    <span
      className={cn(
        "grid h-10 w-10 place-items-center rounded-lg",
        tone === "success"
          ? "bg-green-50 text-status-online"
          : "bg-canvas text-muted",
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
    </span>

    <p className="mt-4 text-[13px] text-muted">{label}</p>
    <p
      className={cn(
        "mt-1 text-lg font-bold",
        tone === "success" ? "text-status-online" : "text-heading",
      )}
    >
      {value}
    </p>
    {detail && <p className="mt-0.5 text-[13px] text-muted">{detail}</p>}
  </Card>
);
