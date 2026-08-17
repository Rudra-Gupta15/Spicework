import { CheckCircle2, History, MinusCircle, PlusCircle } from "lucide-react";

import {
  Card,
  DataTable,
  Loader,
  PRIMARY_CELL,
  type Column,
} from "@/components/ui";
import {
  useDeviceDiff,
  type DiffApp,
  type HardwareChange,
} from "@/data/deviceApi";

interface DeviceLogsTabProps {
  deviceId: string;
  /** Which slice of the diff to show — each detail page owns its own domain. */
  domain: "hardware" | "software";
}

const appLabel = (app: DiffApp): string =>
  [app.name || "Unknown", app.version].filter(Boolean).join(" ");

const appPublisher = (app: DiffApp): string =>
  app.publisher || app.vendor || "—";

const HW_COLUMNS: Column<HardwareChange>[] = [
  { key: "field", header: "Field", cellClassName: PRIMARY_CELL },
  {
    key: "previous",
    header: "Previous",
    wrap: true,
    render: (row) => <span className="text-muted">{row.previous}</span>,
  },
  {
    key: "current",
    header: "Current",
    wrap: true,
    render: (row) => (
      <span className="font-semibold text-status-online">{row.current}</span>
    ),
  },
];

const appColumns = (tone: "installed" | "removed"): Column<DiffApp>[] => [
  {
    key: "name",
    header: "Application",
    wrap: true,
    cellClassName: PRIMARY_CELL,
    render: (app) => appLabel(app),
  },
  { key: "publisher", header: "Publisher", wrap: true, render: appPublisher },
  {
    key: "change",
    header: "",
    align: "right",
    render: () => (
      <span
        className={
          tone === "installed"
            ? "inline-flex items-center gap-1 text-[13px] font-semibold text-status-online"
            : "inline-flex items-center gap-1 text-[13px] font-semibold text-status-offline"
        }
      >
        {tone === "installed" ? (
          <>
            <PlusCircle className="h-3.5 w-3.5" strokeWidth={2.2} /> Installed
          </>
        ) : (
          <>
            <MinusCircle className="h-3.5 w-3.5" strokeWidth={2.2} /> Removed
          </>
        )}
      </span>
    ),
  },
];

/** Centered "nothing changed" flag — the happy path. */
const NoChanges = ({ note }: { note: string }) => (
  <div className="grid place-items-center rounded-lg border border-status-online/25 bg-green-50 py-12 text-center">
    <CheckCircle2 className="h-9 w-9 text-status-online" strokeWidth={1.7} />
    <p className="mt-3 text-sm font-semibold text-heading">No changes detected</p>
    <p className="mt-1 text-[13px] text-muted">{note}</p>
  </div>
);

/**
 * Logs tab: what changed between a device's two most recent scans, from
 * /api/device-diff. Hardware pages show field-level hardware/OS changes;
 * software pages show installed/removed apps. When there's nothing to compare
 * (only one scan) or nothing changed, it says so rather than showing an empty
 * table.
 */
export const DeviceLogsTab = ({ deviceId, domain }: DeviceLogsTabProps) => {
  const { diff, isLoading, error } = useDeviceDiff(deviceId);

  if (isLoading) {
    return (
      <Card className="p-8">
        <Loader label="Comparing the two most recent scans…" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-status-offline">{error}</p>
      </Card>
    );
  }

  if (!diff) return null;

  /* Fewer than two scans — nothing to diff against yet. */
  if (!diff.has_diff) {
    return (
      <Card className="p-5">
        <h2 className="text-base font-bold text-heading">Change Log</h2>
        <div className="mt-4 grid place-items-center rounded-lg border border-line bg-canvas py-12 text-center">
          <History className="h-9 w-9 text-navy-300" strokeWidth={1.6} />
          <p className="mt-3 text-sm font-semibold text-heading">
            Nothing to compare yet
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {diff.message ?? "At least two scans are needed to show changes."}{" "}
            ({diff.scan_count} scan{diff.scan_count === 1 ? "" : "s"} on record)
          </p>
        </div>
      </Card>
    );
  }

  const scanHeader = (
    <p className="text-[13px] text-muted">
      Current{" "}
      <span className="font-semibold text-heading">{diff.current_scan}</span> vs
      previous{" "}
      <span className="font-semibold text-heading">{diff.previous_scan}</span>
    </p>
  );

  if (domain === "hardware") {
    const changes = diff.hw_changes ?? [];
    return (
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-base font-bold text-heading">
            Hardware Change Log
          </h2>
          {scanHeader}
        </div>
        <div className="mt-4">
          {changes.length === 0 ? (
            <NoChanges note={`No hardware or OS changes since the previous scan (${diff.previous_scan}).`} />
          ) : (
            <DataTable
              columns={HW_COLUMNS}
              rows={changes}
              rowKey={(row) => row.field}
              bordered
              uppercaseHeaders
            />
          )}
        </div>
      </Card>
    );
  }

  const installed = diff.newly_installed ?? [];
  const removed = diff.newly_removed ?? [];
  const unchanged = installed.length === 0 && removed.length === 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-base font-bold text-heading">Software Change Log</h2>
        {scanHeader}
      </div>

      {unchanged ? (
        <div className="mt-4">
          <NoChanges note={`No apps installed or removed since the previous scan (${diff.previous_scan}).`} />
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {installed.length > 0 && (
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-status-online">
                Installed ({installed.length})
              </h3>
              <DataTable
                columns={appColumns("installed")}
                rows={installed}
                rowKey={(app) => `in-${appLabel(app)}`}
                bordered
                uppercaseHeaders
              />
            </section>
          )}

          {removed.length > 0 && (
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-status-offline">
                Removed ({removed.length})
              </h3>
              <DataTable
                columns={appColumns("removed")}
                rows={removed}
                rowKey={(app) => `out-${appLabel(app)}`}
                bordered
                uppercaseHeaders
              />
            </section>
          )}
        </div>
      )}
    </Card>
  );
};
