import { useMemo } from "react";

import { DataTable, type Column } from "@/components/ui";
import { HARDWARE_COLUMNS } from "@/data/hardware";
import type { HardwareColumnKey, HardwareDevice } from "@/types/hardware";

/** Per-column presentation; anything not listed uses the plain default. */
const COLUMN_STYLES: Partial<
  Record<HardwareColumnKey, Pick<Column<HardwareDevice>, "render" | "wrap" | "cellClassName">>
> = {
  name: {
    render: (device) => (
      <span className="font-semibold text-heading">{device.name}</span>
    ),
  },
  serialNumber: {
    wrap: true,
    cellClassName: "max-w-[150px] font-semibold break-all",
  },
  type: { cellClassName: "text-muted" },
  manufacturer: { cellClassName: "text-muted" },
  status: { cellClassName: "text-muted" },
  lastScan: { cellClassName: "text-muted" },
  ipAddress: { cellClassName: "text-muted" },
  osVersion: { cellClassName: "text-muted" },
  location: { cellClassName: "text-muted" },
  assignedTo: { cellClassName: "text-muted" },
};

interface HardwareTableProps {
  devices: HardwareDevice[];
  /** Keys to render, in registry order. */
  visibleColumns: HardwareColumnKey[];
}

export const HardwareTable = ({
  devices,
  visibleColumns,
}: HardwareTableProps) => {
  const columns = useMemo<Column<HardwareDevice>[]>(
    () =>
      HARDWARE_COLUMNS.filter((column) =>
        visibleColumns.includes(column.key),
      ).map((column) => ({
        key: column.key,
        header: column.label,
        ...COLUMN_STYLES[column.key],
      })),
    [visibleColumns],
  );

  return (
    <DataTable
      columns={columns}
      rows={devices}
      rowKey={(device) => device.id}
      bordered
      dense
      uppercaseHeaders
      emptyMessage="No devices match the current filters."
    />
  );
};
