import { DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import type { CloudUsageRow } from "@/types/cloud";

const USAGE_COLUMNS: Column<CloudUsageRow>[] = [
  {
    key: "department",
    header: "Department Name",
    cellClassName: PRIMARY_CELL,
  },
  { key: "activeUsers", header: "Active Users" },
  { key: "scale", header: "Compute/Service Scale" },
  { key: "consumption", header: "Network & Storage Consumption" },
  { key: "costShare", header: "Cost Share", cellClassName: "font-semibold" },
];

/** Per-department split of a cloud service's seats, scale and spend. */
export const CloudUsageTable = ({ rows }: { rows: CloudUsageRow[] }) => (
  <DataTable
    columns={USAGE_COLUMNS}
    rows={rows}
    rowKey={(row) => row.id}
    bordered
    emptyMessage="No usage reported for this service."
  />
);
