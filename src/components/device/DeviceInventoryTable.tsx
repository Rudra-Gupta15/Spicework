import { useMemo } from "react";
import { Eye, Pencil } from "lucide-react";

import { ManualBadge } from "@/components/common/ManualBadge";
import { DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import {
  categoryTracksAssignment,
  formatDeviceDate,
  needsAdoption,
} from "@/data/deviceInventory";
import type { DeviceCategory, DeviceColumnKey, DeviceRecord } from "@/types/device";

interface DeviceInventoryTableProps {
  devices: DeviceRecord[];
  /** Which tab this is — decides whether Assign/Current User apply. */
  category: DeviceCategory;
  /** Data columns to show, from Customize View — Assign and the trailing
      edit action are not part of this and always show regardless. */
  visibleColumns: DeviceColumnKey[];
  /** Opens the hand-off history for that row. */
  onViewHistory: (device: DeviceRecord) => void;
  /** Opens the edit form — a row nothing has registered yet instead adds it
      to the registry. */
  onEdit: (device: DeviceRecord) => void;
  emptyMessage: string;
}

/** The registered units of one category — name, serial, buy date, holder. */
export const DeviceInventoryTable = ({
  devices,
  category,
  visibleColumns,
  onViewHistory,
  onEdit,
  emptyMessage,
}: DeviceInventoryTableProps) => {
  const trackAssignment = categoryTracksAssignment(category);

  const columns = useMemo<Column<DeviceRecord>[]>(() => {
    const allBase: Column<DeviceRecord>[] = [
      /* Only the device name is emphasised — the same rule every other
         table in the app follows. */
      {
        key: "name",
        header: "Device",
        cellClassName: PRIMARY_CELL,
        render: (device) => (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center">
              {device.name}
              {/* A row nothing here fabricated and no scan reported —
                  someone typed this name into Add or the adoption form
                  themselves. */}
              {!needsAdoption(device) && <ManualBadge />}
            </span>
            {device.isDemo && (
              <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-muted">
                Demo
              </span>
            )}
          </span>
        ),
      },
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
    ];

    const base = allBase.filter((column) =>
      visibleColumns.includes(column.key as DeviceColumnKey),
    );

    /* Printer and Projector are shared-space equipment with no one holder to
       show or hand off — see `categoryTracksAssignment`. */
    const assignment: Column<DeviceRecord>[] = trackAssignment
      ? [
          {
            key: "assign",
            header: "Assign",
            render: (device) =>
              /* A row nothing has registered yet has no id the server
                 knows, so there is no real history to fetch — the button
                 would only produce a confusing failed request. */
              needsAdoption(device) ? (
                <span className="text-[13px] text-muted">—</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onViewHistory(device)}
                  className="inline-flex items-center gap-2 rounded-md text-[13px] font-semibold text-brand transition-colors hover:underline"
                >
                  <Eye className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  View History
                  <span className="sr-only"> for {device.name}</span>
                </button>
              ),
          },
          ...(visibleColumns.includes("currentUser")
            ? [
                {
                  key: "currentUser",
                  header: "Current User",
                  /* An empty holder is a real state — the unit is in the store. */
                  render: (device: DeviceRecord) =>
                    device.currentUser || (
                      <span className="font-medium text-status-maintenance">Unassigned</span>
                    ),
                } satisfies Column<DeviceRecord>,
              ]
            : []),
        ]
      : [];

    const edit: Column<DeviceRecord>[] = [
      {
        key: "edit",
        header: "",
        align: "right",
        render: (device) => (
          <button
            type="button"
            onClick={() => onEdit(device)}
            title={needsAdoption(device) ? "Add to registry" : "Edit"}
            className="inline-flex rounded-md p-1 text-brand transition-colors hover:bg-brand-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">
              {needsAdoption(device) ? "Add to registry" : "Edit"} {device.name}
            </span>
          </button>
        ),
      },
    ];

    return [...base, ...assignment, ...edit];
  }, [trackAssignment, visibleColumns, onViewHistory, onEdit]);

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
