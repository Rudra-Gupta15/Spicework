import { useMemo } from "react";
import { Link } from "react-router-dom";

import { DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { SOFTWARE_INVENTORY_COLUMNS } from "@/data/softwareInventory";
import type { SoftwareColumnKey, SoftwareInventoryItem } from "@/types/software";

/** Each device that has this app installed links to its own Software detail page. */
const renderDevices = (item: SoftwareInventoryItem) => (
  <div className="flex flex-wrap gap-x-1.5 gap-y-1">
    {item.devices.map((device, index) => (
      <span key={device.id}>
        <Link
          to={`/inventory/software/${encodeURIComponent(device.id)}`}
          className="text-status-info hover:underline"
        >
          {device.name}
        </Link>
        {index < item.devices.length - 1 && <span className="text-muted">,</span>}
      </span>
    ))}
  </div>
);

const COLUMN_STYLES: Partial<
  Record<SoftwareColumnKey, Pick<Column<SoftwareInventoryItem>, "render" | "wrap" | "cellClassName" | "align">>
> = {
  name: { cellClassName: PRIMARY_CELL, wrap: true },
  publisher: { wrap: true, cellClassName: "max-w-[200px]" },
  installCount: { align: "right", cellClassName: "tabular-nums" },
  installedOn: { wrap: true, cellClassName: "max-w-[280px]", render: renderDevices },
};

interface SoftwareInventoryTableProps {
  items: SoftwareInventoryItem[];
  visibleColumns: SoftwareColumnKey[];
}

/** Estate-wide software table — one row per distinct application + version. */
export const SoftwareInventoryTable = ({
  items,
  visibleColumns,
}: SoftwareInventoryTableProps) => {
  const columns = useMemo<Column<SoftwareInventoryItem>[]>(
    () =>
      SOFTWARE_INVENTORY_COLUMNS.filter((column) => visibleColumns.includes(column.key)).map(
        (column) => ({
          key: column.key,
          header: column.label,
          ...COLUMN_STYLES[column.key],
        }),
      ),
    [visibleColumns],
  );

  return (
    <DataTable
      columns={columns}
      rows={items}
      rowKey={(item) => item.id}
      bordered
      uppercaseHeaders
      emptyMessage="No applications match the current search."
    />
  );
};
