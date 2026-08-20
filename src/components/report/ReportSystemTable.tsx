import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import {
  Badge,
  Checkbox,
  DataTable,
  PRIMARY_CELL,
  type Column,
} from "@/components/ui";
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
  /** Ids ticked for a combined download — across every page, not just this one. */
  checkedIds: ReadonlySet<string>;
  onCheck: (id: string, checked: boolean) => void;
  /** Ticks or clears every system on the page in one go. */
  onCheckAll: (checked: boolean) => void;
}

/**
 * Stops a click or a keypress on the tick box from reaching the row, which
 * would otherwise leave the list for the report preview.
 */
const swallow = (event: { stopPropagation: () => void }): void =>
  event.stopPropagation();

/** The list of systems a report can be generated for. */
export const ReportSystemTable = ({
  systems,
  category,
  onSelect,
  checkedIds,
  onCheck,
  onCheckAll,
}: ReportSystemTableProps) => {
  const allChecked =
    systems.length > 0 && systems.every((system) => checkedIds.has(system.id));

  const columns = useMemo<Column<ReportSystem>[]>(
    () => [
      {
        key: "select",
        className: "w-10",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={onCheckAll}
            label="Select every system on this page"
            hideLabel
          />
        ),
        render: (system) => (
          <span
            className="inline-flex"
            onClick={swallow}
            onKeyDown={swallow}
            role="presentation"
          >
            <Checkbox
              checked={checkedIds.has(system.id)}
              onChange={(checked) => onCheck(system.id, checked)}
              label={`Include ${system.name} in the download`}
              hideLabel
            />
          </span>
        ),
      },
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
    [category, allChecked, checkedIds, onCheck, onCheckAll],
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
