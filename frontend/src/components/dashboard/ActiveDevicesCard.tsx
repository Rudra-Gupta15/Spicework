import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { BarChart } from "@/components/charts/BarChart";
import { SectionCard, Select } from "@/components/ui";
import { ACTIVE_DEVICES } from "@/data/dashboard";

/** Active devices over the selected period. */
export const ActiveDevicesCard = () => {
  const [range, setRange] = useState(ACTIVE_DEVICES.ranges[0]);

  return (
    <SectionCard
      title="Date and total active device"
      action={
        <div className="flex items-center gap-1">
          <Select
            options={ACTIVE_DEVICES.ranges}
            value={range}
            onChange={setRange}
            align="right"
            aria-label="Chart period"
          />
          <button
            type="button"
            aria-label="Chart options"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-heading"
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>
        </div>
      }
    >
      <BarChart
        data={ACTIVE_DEVICES.series}
        axisLabel="Devices"
        unit="devices"
      />

      <div className="mt-6 flex items-start gap-12 border-t border-line pt-4">
        <div>
          <p className="text-xl font-bold text-status-info tabular-nums">
            {ACTIVE_DEVICES.total}
          </p>
          <p className="mt-0.5 text-xs text-muted">Total active devices</p>
        </div>
        <div>
          <p className="text-xl font-bold text-heading">
            {ACTIVE_DEVICES.lastUpdated}
          </p>
          <p className="mt-0.5 text-xs text-muted">Last Updated</p>
        </div>
      </div>
    </SectionCard>
  );
};
