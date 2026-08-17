import { useMemo } from "react";

import { DonutChart } from "@/components/charts/DonutChart";
import { Loader, SectionCard } from "@/components/ui";
import { useDeviceList } from "@/data/deviceApi";
import type { Segment } from "@/types/dashboard";

/** Online vs Offline, live from the same device list the Hardware page's KPI
    tiles use (status derived from last_seen — online within the last 24h). */
export const DeviceStatusCard = () => {
  const { devices, isLoading, error } = useDeviceList();

  const { segments, total, onlineShare } = useMemo(() => {
    const online = devices.filter((device) => device.status === "ONLINE").length;
    const offline = devices.length - online;

    const segs: Segment[] = [
      { id: "online", label: "Online", value: online, color: "var(--color-status-online)" },
      { id: "offline", label: "Offline", value: offline, color: "var(--color-status-neutral)" },
    ];

    return {
      segments: segs,
      total: devices.length,
      onlineShare: devices.length > 0 ? Math.round((online / devices.length) * 100) : 0,
    };
  }, [devices]);

  return (
    <SectionCard title="Device Status">
      {error && <p className="text-[13px] text-status-offline">{error}</p>}

      {isLoading ? (
        <Loader label="Loading device status…" />
      ) : (
        <div className="flex flex-col items-center">
          <DonutChart segments={segments} size={150} thickness={16} rounded>
            <div>
              <p className="text-[28px] leading-none font-bold text-heading tabular-nums">
                {total}
              </p>
              <p className="mt-1 text-xs text-muted">Devices</p>
            </div>
          </DonutChart>

          <ul className="mt-5 w-full space-y-2.5">
            {segments.map((segment) => (
              <li key={segment.id} className="flex items-center gap-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-heading">{segment.label}</span>
                <span className="font-semibold text-heading tabular-nums">
                  {segment.value}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-muted">
            {onlineShare}% online right now (last seen within 24h)
          </p>
        </div>
      )}
    </SectionCard>
  );
};
