import { useState } from "react";

import { Button, Card, Field, Input, ProgressBar, Toggle } from "@/components/ui";
import { downloadCsv } from "@/lib/csv";
import { BACKUP_DEFAULTS } from "@/data/settings";

/** The Backup & Data category: exports, automated backups and retention. */
export const BackupSettings = () => {
  const [values, setValues] = useState(BACKUP_DEFAULTS);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const exportData = () => {
    downloadCsv(
      `spiceworks-export-${values.exportFormat.toLowerCase()}.csv`,
      ["Asset", "Type", "Status", "Last Seen"],
      [["Dell Latitude 5520", "Laptop", "Active", "2 minutes ago"]],
    );
  };

  const backupNow = () => {
    const now = new Date();
    const stamp = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString(
      "en-US",
      { hour: "2-digit", minute: "2-digit" },
    )}`;
    set("lastBackup", stamp);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="px-5 py-5">
          <h2 className="mb-4 text-base font-bold text-heading">Data Export</h2>

          <div className="flex flex-wrap items-end gap-4">
            <Field
              label="Export Format"
              htmlFor="export-format"
              className="w-full sm:w-40"
            >
              <Input
                id="export-format"
                className="bg-canvas"
                value={values.exportFormat}
                onChange={(e) => set("exportFormat", e.target.value)}
              />
            </Field>
            <Field
              label="Date Range"
              htmlFor="date-range"
              className="w-full sm:w-44"
            >
              <Input
                id="date-range"
                className="bg-canvas"
                value={values.dateRange}
                onChange={(e) => set("dateRange", e.target.value)}
              />
            </Field>
            <Button variant="brand" size="lg" onClick={exportData}>
              Export Data
            </Button>
          </div>
        </Card>

        <Card className="px-5 py-5">
          <h2 className="text-base font-bold text-heading">
            Automated Backups
          </h2>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading">
                Enable automated backups
              </p>
              <p className="mt-0.5 text-[13px] text-muted">
                Schedule daily snapshots of all devices, logs, and configurations
              </p>
            </div>
            <Toggle
              checked={values.enableBackups}
              onChange={(next) => set("enableBackups", next)}
              label="Enable automated backups"
              hideLabel
            />
          </div>

          <Field className="mt-4" label="Backup Frequency" htmlFor="backup-freq">
            <Input
              id="backup-freq"
              className="bg-canvas"
              value={values.backupFrequency}
              onChange={(e) => set("backupFrequency", e.target.value)}
            />
          </Field>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
                Last Backup
              </p>
              <p className="mt-1 text-sm font-semibold text-heading">
                {values.lastBackup}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
                Next Scheduled
              </p>
              <p className="mt-1 text-sm font-semibold text-heading">
                {values.nextScheduled}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-4 border-brand text-brand hover:bg-brand-50"
            onClick={backupNow}
          >
            Backup Now
          </Button>
        </Card>
      </div>

      <Card className="h-fit px-5 py-5">
        <h2 className="mb-4 text-base font-bold text-heading">
          Data Retention
        </h2>

        <Field label="Retention Period" htmlFor="retention">
          <Input
            id="retention"
            className="bg-canvas"
            value={values.retentionPeriod}
            onChange={(e) => set("retentionPeriod", e.target.value)}
          />
        </Field>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading">
              Auto-delete old records
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              Permanently purge assets and logs past retention threshold
            </p>
          </div>
          <Toggle
            checked={values.autoDelete}
            onChange={(next) => set("autoDelete", next)}
            label="Auto-delete old records"
            hideLabel
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-heading">
              Cloud Storage Used
            </p>
            <span className="text-sm font-bold text-brand tabular-nums">
              {values.cloudUsedPct}%
            </span>
          </div>
          <ProgressBar
            className="mt-2"
            value={values.cloudUsedPct}
            color="var(--color-brand)"
            label="Cloud storage used"
          />
          <p className="mt-2 text-[13px] text-muted">{values.cloudRemaining}</p>
        </div>
      </Card>
    </div>
  );
};
