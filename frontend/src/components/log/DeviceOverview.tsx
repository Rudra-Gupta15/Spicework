import { CircleCheck, Monitor, Tag, UserRound } from "lucide-react";

import { Card, ProgressBar } from "@/components/ui";
import {
  DEVICE_ACTIVITY,
  DEVICE_HEALTH,
  DEVICE_INFO,
  DEVICE_SPECS,
} from "@/data/deviceLog";

import { DeviceInfoCard } from "./DeviceInfoCard";
import { LogAvatar } from "./LogAvatar";

const HEALTH_COLORS = {
  good: "var(--color-status-online)",
  warning: "var(--color-status-maintenance)",
} as const;

/** The Overview tab: summary tiles, specs, health meters and recent activity. */
export const DeviceOverview = () => (
  <div className="space-y-6">
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <DeviceInfoCard
        icon={Monitor}
        label="Device Name"
        value={DEVICE_INFO.name}
      />
      <DeviceInfoCard
        icon={Tag}
        label="Asset Tag"
        value={DEVICE_INFO.assetTag}
      />
      <DeviceInfoCard
        icon={CircleCheck}
        label="Status"
        value={DEVICE_INFO.status}
        detail={DEVICE_INFO.statusDetail}
        tone="success"
      />
      <DeviceInfoCard
        icon={UserRound}
        label="Assigned To"
        value={DEVICE_INFO.assignee}
        detail={DEVICE_INFO.assigneeTeam}
      />
    </section>

    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <h2 className="border-b border-line bg-canvas px-5 py-3.5 text-[15px] font-bold text-heading">
          Quick Specifications & Metadata
        </h2>

        <dl>
          {DEVICE_SPECS.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 last:border-b-0"
            >
              <dt className="text-sm text-muted">{spec.label}</dt>
              <dd className="text-sm font-semibold text-heading">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">
          Device Health Diagnostics
        </h2>

        <div className="mt-4 space-y-5">
          {DEVICE_HEALTH.map((metric) => (
            <div
              key={metric.label}
              className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1"
            >
              <p className="text-sm font-semibold text-heading">
                {metric.label}
              </p>
              <ProgressBar
                className="col-start-2 row-span-2 w-40 self-center sm:w-52"
                value={metric.value}
                color={HEALTH_COLORS[metric.tone]}
                label={`${metric.label}: ${metric.detail}`}
              />
              <p className="text-[13px] text-muted">{metric.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>

    <Card className="px-5 py-5">
      <h2 className="text-base font-bold text-heading">
        Recent Activity & Diagnostics
      </h2>

      <ul className="mt-3">
        {DEVICE_ACTIVITY.map((entry) => (
          <li
            key={entry.id}
            className="flex gap-3 border-b border-line py-4 last:border-b-0"
          >
            <LogAvatar name={entry.author} kind={entry.kind} />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold text-heading">
                  {entry.author}
                </span>{" "}
                <span className="text-muted">{entry.timestamp}</span>
              </p>
              <p className="mt-1 text-sm text-heading">{entry.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  </div>
);
