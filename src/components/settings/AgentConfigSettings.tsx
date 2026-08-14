import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Apple, Download, Package, Terminal } from "lucide-react";

import { Card, Field, Input, Toggle } from "@/components/ui";
import { cn } from "@/lib/cn";
import { downloadText } from "@/lib/download";
import {
  COLLECTION_METRICS,
  DEPLOYMENT_PACKAGES,
  SCAN_DEPTHS,
} from "@/data/settings";

const PACKAGE_ICONS: Record<string, LucideIcon> = {
  win: Package,
  mac: Apple,
  linux: Terminal,
};

/** The Agent Config category: scan settings, metrics and deployment packages. */
export const AgentConfigSettings = () => {
  const [interval, setInterval] = useState("Daily");
  const [depth, setDepth] = useState("standard");
  const [metrics, setMetrics] = useState(COLLECTION_METRICS);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const toggleMetric = (id: string, next: boolean) =>
    setMetrics((current) =>
      current.map((metric) =>
        metric.id === id ? { ...metric, enabled: next } : metric,
      ),
    );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">
            Scan Settings
          </h2>

          <Field label="Scan Interval" htmlFor="scan-interval">
            <Input
              id="scan-interval"
              className="bg-canvas"
              value={interval}
              onChange={(event) => setInterval(event.target.value)}
            />
          </Field>

          <p className="mt-4 mb-2 text-[13px] font-semibold text-heading">
            Scan Depth
          </p>
          <div className="space-y-2">
            {SCAN_DEPTHS.map((option) => {
              const isActive = option.id === depth;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDepth(option.id)}
                  className="flex w-full items-start gap-3 rounded-lg text-left focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 transition-colors",
                      isActive ? "border-brand" : "border-field",
                    )}
                  >
                    {isActive && (
                      <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-heading">
                      {option.title}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="px-5 py-5">
          <h2 className="text-base font-bold text-heading">
            Data Collection Metrics
          </h2>

          <div className="mt-2">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading">
                    {metric.title}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {metric.description}
                  </p>
                </div>
                <Toggle
                  checked={metric.enabled}
                  onChange={(next) => toggleMetric(metric.id, next)}
                  label={metric.title}
                  hideLabel
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="h-fit px-5 py-5">
        <h2 className="text-base font-bold text-heading">
          Deployment Packages
        </h2>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading">
              Auto-Update Agents
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              Automatically patch all connected background daemons
            </p>
          </div>
          <Toggle
            checked={autoUpdate}
            onChange={setAutoUpdate}
            label="Auto-Update Agents"
            hideLabel
          />
        </div>

        <p className="mt-5 mb-2 text-[13px] font-semibold text-heading">
          Download Packages
        </p>
        <ul className="space-y-2.5">
          {DEPLOYMENT_PACKAGES.map((pkg) => {
            const Icon = PACKAGE_ICONS[pkg.id] ?? Package;

            return (
              <li key={pkg.id}>
                <div className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas text-muted"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-heading">
                      {pkg.name}
                    </p>
                    <p className="text-[13px] text-muted">{pkg.detail}</p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Download ${pkg.name}`}
                    onClick={() =>
                      downloadText(
                        pkg.filename,
                        `# ${pkg.name}\n# Spiceworks collector agent — prototype placeholder\n`,
                      )
                    }
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-heading focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
                  >
                    <Download className="h-[18px] w-[18px]" strokeWidth={2} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};
