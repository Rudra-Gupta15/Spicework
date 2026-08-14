import { Plus } from "lucide-react";

import { Button, Card, DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { DEVICE_HISTORY, type HistoryRow } from "@/data/deviceLog";
import { downloadCsv } from "@/lib/csv";

const columns: Column<HistoryRow>[] = [
  { key: "date", header: "Date", cellClassName: "text-muted whitespace-nowrap" },
  { key: "time", header: "Time", cellClassName: "text-muted whitespace-nowrap" },
  { key: "user", header: "User", cellClassName: PRIMARY_CELL },
  { key: "action", header: "Action" },
  { key: "category", header: "Category", cellClassName: "text-muted" },
  { key: "details", header: "Details", wrap: true, cellClassName: "text-muted" },
];

const CSV_HEADERS = ["Date", "Time", "User", "Action", "Category", "Details"];

/** The History tab: the full system activity log with a CSV export. */
export const LogHistory = () => {
  const exportLog = () => {
    downloadCsv(
      "device-activity-history.csv",
      CSV_HEADERS,
      DEVICE_HISTORY.map((row) => [
        row.date,
        row.time,
        row.user,
        row.action,
        row.category,
        row.details,
      ]),
    );
  };

  return (
    <Card className="px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-heading">
          System Activity History
        </h2>

        <Button
          variant="brand"
          leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
          onClick={exportLog}
        >
          Export Log
        </Button>
      </div>

      <DataTable
        className="mt-4"
        columns={columns}
        rows={DEVICE_HISTORY}
        rowKey={(row) => row.id}
        uppercaseHeaders
        bordered
        emptyMessage="No activity has been recorded yet."
      />
    </Card>
  );
};
