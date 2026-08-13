import { useMemo } from "react";

import { DataTable, type Column } from "@/components/ui";
import type { HardwareDevice } from "@/types/hardware";

interface HardwareTableProps {
  devices: HardwareDevice[];
}

export const HardwareTable = ({ devices }: HardwareTableProps) => {
  const columns = useMemo<Column<HardwareDevice>[]>(
    () => [
      {
        key: "name",
        header: "Device Name",
        render: (device) => (
          <span className="font-semibold text-heading">{device.name}</span>
        ),
      },
      { key: "type", header: "Type", cellClassName: "text-muted" },
      {
        key: "manufacturer",
        header: "Manufacturer",
        cellClassName: "text-muted",
      },
      {
        key: "serialNumber",
        header: "Serial Number",
        wrap: true,
        cellClassName: "max-w-[150px] font-semibold break-all",
      },
      { key: "status", header: "Status", cellClassName: "text-muted" },
      { key: "lastScan", header: "Last Scan", cellClassName: "text-muted" },
    ],
    [],
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
