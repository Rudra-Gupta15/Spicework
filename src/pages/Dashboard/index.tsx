import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { ActiveDevicesCard } from "@/components/dashboard/ActiveDevicesCard";
import { ActiveOsCard } from "@/components/dashboard/ActiveOsCard";
import { ComplianceCard } from "@/components/dashboard/ComplianceCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { RecentAuditsCard } from "@/components/dashboard/RecentAuditsCard";
import { Select, StatCard } from "@/components/ui";
import { STAT_METRICS } from "@/data/dashboard";
import { CURRENT_USER } from "@/config/user";

const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days"] as const;

const formatStamp = (date: Date): string =>
  `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })} · ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

const DashboardPage = () => {
  const [range, setRange] = useState<string>(DATE_RANGES[0]);
  const firstName = CURRENT_USER.name.split(" ")[0];
  const stamp = useMemo(() => formatStamp(new Date()), []);

  return (
    <>
      <Navbar
        title={`Welcome back, ${firstName}!`}
        subtitle="Here is your infrastructure at a glance."
        actions={
          <div className="text-right">
            <Select
              variant="bare"
              options={DATE_RANGES}
              value={range}
              onChange={setRange}
              align="right"
              aria-label="Date range"
              leading={
                <CalendarDays className="h-4 w-4 text-muted" strokeWidth={1.9} />
              }
            />
            <p className="mt-0.5 text-xs text-muted">{stamp}</p>
          </div>
        }
      />

      <div className="mt-6 space-y-5">
        {/* KPI row */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_METRICS.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </section>

        {/* Compliance · activity · OS mix */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
          <ComplianceCard />
          <ActiveDevicesCard />
          <ActiveOsCard />
        </section>

        <RecentAuditsCard />
        <RecentActivityCard />
      </div>
    </>
  );
};

export default DashboardPage;
