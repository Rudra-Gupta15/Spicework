import { useMemo } from "react";

import { DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { HARDWARE_COLUMNS } from "@/data/hardware";
import type { HardwareColumnKey, HardwareDevice } from "@/types/hardware";

/**
 * Per-column presentation; anything not listed uses the table default.
 * Only the device name is emphasised — the same rule every other table
 * in the app follows.
 */
const COLUMN_STYLES: Partial<
  Record<HardwareColumnKey, Pick<Column<HardwareDevice>, "render" | "wrap" | "cellClassName">>
> = {
  name: { cellClassName: PRIMARY_CELL },
  serialNumber: {
    wrap: true,
    cellClassName: "max-w-[150px] break-all",
  },
};

interface HardwareTableProps {
  devices: HardwareDevice[];
  /** Keys to render, in registry order. */
  visibleColumns: HardwareColumnKey[];
  /** Opens the device detail screen. */
  onSelect?: (device: HardwareDevice) => void;
}

export const HardwareTable = ({
  devices,
  visibleColumns,
  onSelect,
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
      onRowClick={onSelect}
      bordered
      uppercaseHeaders
      emptyMessage="No devices match the current filters."
    />
  );
};
