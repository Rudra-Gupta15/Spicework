import {
  Badge,
  Card,
  DataTable,
  PRIMARY_CELL,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import type { Peripheral } from "@/types/hardware";

const PERIPHERAL_COLUMNS: Column<Peripheral>[] = [
  sequenceColumn(),
  {
    key: "type",
    header: "Type",
    render: (peripheral) => <Badge tone="info">{peripheral.type}</Badge>,
  },
  {
    key: "name",
    header: "Name",
    wrap: true,
    cellClassName: `max-w-[220px] ${PRIMARY_CELL}`,
  },
  {
    key: "description",
    header: "Description",
    wrap: true,
    cellClassName: "max-w-[240px]",
  },
  {
    key: "manufacturer",
    header: "Manufacturer",
    wrap: true,
    cellClassName: "max-w-[150px]",
  },
  { key: "version", header: "Version" },
];

interface PeripheralsTabProps {
  peripherals: Peripheral[];
}

/** Peripherals tab: one row per device the scan found attached. */
export const PeripheralsTab = ({ peripherals }: PeripheralsTabProps) => (
  <Card className="px-5 pt-5 pb-6">
    <h2 className="text-base font-bold text-heading">Connected Peripherals</h2>

    <DataTable
      className="mt-4"
      columns={PERIPHERAL_COLUMNS}
      rows={peripherals}
      rowKey={(peripheral) => peripheral.id}
      bordered
      uppercaseHeaders
      emptyMessage="No peripherals reported for this device."
    />
  </Card>
);
