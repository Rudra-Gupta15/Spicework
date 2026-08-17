import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Input,
  Loader,
  PRIMARY_CELL,
  type Column,
} from "@/components/ui";
import type { NetworkDevice } from "@/types/network";

interface ConnectedDevicesCardProps {
  devices: NetworkDevice[];
  /** Count line under the title, e.g. "20 devices active on subnet …". */
  summary: string;
  search: string;
  onSearchChange: (search: string) => void;
  /** Re-runs the sweep on the active network. */
  onRescan: () => void;
  onExport: () => void;
  /** Hosts that have already been sent a notification, by device id. */
  notified: ReadonlySet<string>;
  onNotify: (device: NetworkDevice) => void;
  isScanning: boolean;
  /** False until an access point has been scanned. */
  canRescan: boolean;
}

/** Hosts found on the active network, with filter and export controls. */
export const ConnectedDevicesCard = ({
  devices,
  summary,
  search,
  onSearchChange,
  onRescan,
  onExport,
  notified,
  onNotify,
  isScanning,
  canRescan,
}: ConnectedDevicesCardProps) => {
  const [pending, setPending] = useState<NetworkDevice | null>(null);

  const columns: Column<NetworkDevice>[] = [
    { key: "ipAddress", header: "IP Address" },
    {
      key: "hostname",
      header: "Hostname / Device",
      className: "max-w-[220px]",
      cellClassName: `${PRIMARY_CELL} truncate`,
    },
    {
      key: "username",
      header: "Username",
      className: "max-w-[200px]",
      cellClassName: "truncate text-muted",
    },
    { key: "os", header: "Operating System", cellClassName: "text-muted" },
    { key: "openPorts", header: "Open Ports" },
    {
      key: "status",
      header: "Status",
      render: (device) => (
        <Badge tone={device.status === "Audited" ? "success" : "warning"}>
          {device.status}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (device) => {
        const isSent = notified.has(device.id);

        return (
          <Button
            variant="primary"
            size="sm"
            disabled={isSent}
            onClick={() => setPending(device)}
          >
            {isSent ? "Notification Sent" : "Send Notification"}
          </Button>
        );
      },
    },
  ];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-heading">Connected Devices</h2>
          <p className="mt-1 text-[13px] text-muted">{summary}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRescan}
            isLoading={isScanning}
            disabled={!canRescan || isScanning}
          >
            Re-scan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={devices.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Filter by IP, Hostname, Username, OS…"
        aria-label="Filter connected devices"
        containerClassName="mt-4"
      />

      {/* A sweep walks the whole subnet, so it is the longest wait on this
          page — the table would otherwise sit empty with no sign of work. */}
      {isScanning ? (
        <Loader label="Scanning the network for devices…" className="mt-4" />
      ) : (
        <DataTable
          className="mt-4"
          columns={columns}
          rows={devices}
          rowKey={(device) => device.id}
          uppercaseHeaders
          bordered
          emptyMessage={
            canRescan
              ? "No devices match the current filter."
              : "Run “Connect & Scan Network” to discover devices on this network."
          }
        />
      )}

      <ConfirmDialog
        isOpen={pending !== null}
        tone="brand"
        title="Send Notification?"
        description={`An audit request will be sent to ${pending?.hostname ?? "this host"} at ${pending?.ipAddress ?? ""}.`}
        cancelLabel="Cancel"
        confirmLabel="Yes, Send Notification"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onNotify(pending);
          setPending(null);
        }}
      />
    </Card>
  );
};
