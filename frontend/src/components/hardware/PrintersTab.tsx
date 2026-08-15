import {
  Badge,
  DataTable,
  PRIMARY_CELL,
  SectionCard,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import type { Printer } from "@/types/hardware";

const PRINTER_COLUMNS: Column<Printer>[] = [
  sequenceColumn(),
  {
    key: "name",
    header: "Printer Name",
    wrap: true,
    cellClassName: `max-w-[220px] ${PRIMARY_CELL}`,
  },
  { key: "systemName", header: "System Name" },
  { key: "portName", header: "Port Name" },
  { key: "status", header: "Status" },
  { key: "bidirectional", header: "Bidirectional" },
];

interface PrintersTabProps {
  printers: Printer[];
}

/** Printers tab: every print queue the scan attached to the device. */
export const PrintersTab = ({ printers }: PrintersTabProps) => (
  <SectionCard
    title="Connected Printer Details"
    action={
      <Badge tone="info">
        {printers.length} {printers.length === 1 ? "printer" : "printers"}
      </Badge>
    }
  >
    <DataTable
      columns={PRINTER_COLUMNS}
      rows={printers}
      rowKey={(printer) => printer.id}
      bordered
      uppercaseHeaders
      emptyMessage="No printers reported for this device."
    />
  </SectionCard>
);
