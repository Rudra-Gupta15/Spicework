import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import { Badge, DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import { RECORD_LABEL } from "@/data/report";
import { cn } from "@/lib/cn";
import type { ReportCategory, ReportSystem } from "@/types/report";

const STATUS_STYLES: Record<ReportSystem["status"], string> = {
  ONLINE: "text-status-online",
  OFFLINE: "text-status-offline",
  MAINTENANCE: "text-status-maintenance",
};

interface ReportSystemTableProps {
  systems: ReportSystem[];
  category: ReportCategory;
  /** Opens the report preview for the picked system. */
  onSelect: (system: ReportSystem) => void;
}

/** The list of systems a report can be generated for. */
export const ReportSystemTable = ({
  systems,
  category,
  onSelect,
}: ReportSystemTableProps) => {
  const columns = useMemo<Column<ReportSystem>[]>(
    () => [
      { key: "name", header: "System Name", cellClassName: PRIMARY_CELL },
      { key: "type", header: "Type", cellClassName: "text-muted" },
      { key: "manufacturer", header: "Manufacturer", cellClassName: "text-muted" },
      {
        key: "serialNumber",
        header: "Serial Number",
        wrap: true,
        cellClassName: "max-w-[150px] break-all text-muted",
      },
      {
        key: "status",
        header: "Status",
        render: (system) => (
          <span className={cn("font-semibold", STATUS_STYLES[system.status])}>
            {system.status}
          </span>
        ),
      },
      {
        key: "scope",
        header: "Scope",
        render: (system) => (
          <Badge tone={system.scope === "Private" ? "neutral" : "success"}>
            {system.scope}
          </Badge>
        ),
      },
      {
        key: "records",
        header: RECORD_LABEL[category],
        align: "right",
        cellClassName: "tabular-nums text-muted",
      },
      { key: "lastScan", header: "Last Scan", cellClassName: "text-muted" },
      {
        key: "action",
        header: "",
        align: "right",
        render: () => (
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600">
            View Report
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </span>
        ),
      },
    ],
    [category],
  );

  return (
    <DataTable
      columns={columns}
      rows={systems}
      rowKey={(system) => system.id}
      onRowClick={onSelect}
      bordered
      uppercaseHeaders
      emptyMessage="No systems match these filters."
    />
  );
};
