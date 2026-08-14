import { useMemo, useState } from "react";

import {
  Badge,
  Card,
  DataTable,
  PRIMARY_CELL,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import { countByVia } from "@/data/hardwareConnected";
import { cn } from "@/lib/cn";
import type { ConnectedDevice, ConnectedVia } from "@/types/hardware";

const ALL = "All";

/**
 * Connection buses are a category, not a status, so they get their own
 * palette rather than reusing the semantic Badge tones.
 */
const VIA_PILL: Record<ConnectedVia, string> = {
  Bluetooth: "bg-blue-50 text-status-info",
  "PCI / PCIe Slot": "bg-blue-50 text-status-info",
  USB: "bg-blue-50 text-status-info",
  "USB Storage": "bg-blue-50 text-status-info",
  "HID (USB/Bluetooth)": "bg-indigo-50 text-indigo-600",
  "Drive Bus": "bg-amber-50 text-status-maintenance",
  Other: "bg-amber-50 text-status-maintenance",
  "Internal Panel": "bg-canvas text-muted",
};

const COLUMNS: Column<ConnectedDevice>[] = [
  sequenceColumn(),
  {
    key: "name",
    header: "Device Name",
    wrap: true,
    cellClassName: `max-w-[240px] ${PRIMARY_CELL}`,
  },
  { key: "category", header: "Category" },
  {
    key: "via",
    header: "Connected Via",
    render: (device) => (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
          VIA_PILL[device.via],
        )}
      >
        {device.via}
      </span>
    ),
  },
  { key: "port", header: "Port" },
  {
    key: "manufacturer",
    header: "Manufacturer",
    wrap: true,
    cellClassName: "max-w-[160px]",
  },
  { key: "serial", header: "Serial" },
  {
    key: "status",
    header: "Status",
    render: (device) => <Badge tone="success">{device.status}</Badge>,
  },
];

interface ConnectedDevicesTabProps {
  devices: ConnectedDevice[];
}

/** Connected Devices tab: every attached device, filterable by bus. */
export const ConnectedDevicesTab = ({ devices }: ConnectedDevicesTabProps) => {
  const [filter, setFilter] = useState<ConnectedVia | typeof ALL>(ALL);

  const chips = useMemo(
    () => [
      { key: ALL, label: `All (${devices.length})` },
      ...countByVia(devices).map(({ via, count }) => ({
        key: via,
        label: `${via} (${count})`,
      })),
    ],
    [devices],
  );

  const visible = useMemo(
    () =>
      filter === ALL ? devices : devices.filter((item) => item.via === filter),
    [devices, filter],
  );

  return (
    <Card className="px-5 pt-5 pb-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold text-heading">
          All Connected Devices
        </h2>

        <span className="shrink-0 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white">
          {devices.length} {devices.length === 1 ? "device" : "devices"}
        </span>
      </div>

      <p className="mt-3 max-w-4xl text-[13px] leading-relaxed text-muted">
        Every device attached to any port or slot - USB, PCI/PCIe, Bluetooth,
        serial (COM), and display outputs. A projector or external monitor
        appears here with the video port it is plugged into.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = chip.key === filter;

          return (
            <button
              key={chip.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(chip.key as ConnectedVia | typeof ALL)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                isActive
                  ? "border-transparent bg-navy-900 text-white"
                  : "border-line bg-surface text-heading hover:bg-canvas",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <DataTable
        className="mt-4"
        columns={COLUMNS}
        rows={visible}
        rowKey={(item) => item.id}
        bordered
        uppercaseHeaders
        emptyMessage="No connected devices reported for this device."
      />
    </Card>
  );
};
