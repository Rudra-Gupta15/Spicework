import { useMemo } from "react";
import { Eye } from "lucide-react";

import { DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { formatDeviceDate } from "@/data/deviceInventory";
import type { DeviceRecord } from "@/types/device";

interface DeviceInventoryTableProps {
  devices: DeviceRecord[];
  /** Opens the hand-off history for that row. */
  onViewHistory: (device: DeviceRecord) => void;
  emptyMessage: string;
}

/** The registered units of one category — name, serial, buy date, holder. */
export const DeviceInventoryTable = ({
  devices,
  onViewHistory,
  emptyMessage,
}: DeviceInventoryTableProps) => {
  const columns = useMemo<Column<DeviceRecord>[]>(
    () => [
      /* Only the device name is emphasised — the same rule every other
         table in the app follows. */
      { key: "name", header: "Device", cellClassName: PRIMARY_CELL },
      {
        key: "serialNumber",
        header: "Serial Number",
        wrap: true,
        cellClassName: "max-w-[150px] break-all",
      },
      {
        key: "buyDate",
        header: "Buy Date",
        render: (device) => formatDeviceDate(device.buyDate),
      },
      {
        key: "assign",
        header: "Assign",
        render: (device) => (
          <button
            type="button"
            onClick={() => onViewHistory(device)}
            className="inline-flex items-center gap-2 rounded-md text-[13px] font-semibold text-brand transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Eye className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            View History
            <span className="sr-only"> for {device.name}</span>
          </button>
        ),
      },
      {
        key: "currentUser",
        header: "Current User",
        /* An empty holder is a real state — the unit is in the store. */
        render: (device) =>
          device.currentUser || (
            <span className="font-medium text-status-maintenance">Unassigned</span>
          ),
      },
    ],
    [onViewHistory],
  );

  return (
    <DataTable
      columns={columns}
      rows={devices}
      rowKey={(device) => device.id}
      bordered
      uppercaseHeaders
      emptyMessage={emptyMessage}
    />
  );
};
