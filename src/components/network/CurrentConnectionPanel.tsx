import { Button } from "@/components/ui";
import type { WifiConnection, WifiNetwork } from "@/types/network";

import { SignalBars } from "./SignalBars";

interface CurrentConnectionPanelProps {
  network: WifiNetwork;
  connection: WifiConnection;
  isScanning: boolean;
  onScan: () => void;
}

/** Link summary for the selected access point, plus the scan trigger. */
export const CurrentConnectionPanel = ({
  network,
  connection,
  isScanning,
  onScan,
}: CurrentConnectionPanelProps) => {
  const rows = [
    { label: "IP Address", value: connection.ipAddress },
    { label: "MAC Address", value: connection.macAddress },
    { label: "Security", value: connection.security },
    { label: "Speed", value: connection.speed },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line px-4 py-3.5">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h3 className="truncate font-bold text-heading">{network.ssid}</h3>
          <SignalBars strength={network.signal} className="shrink-0" />
        </div>

        <dl className="mt-3 space-y-2.5 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <dt className="text-muted">{row.label}</dt>
              <dd className="truncate font-semibold text-heading">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Button
        variant="success"
        size="lg"
        fullWidth
        isLoading={isScanning}
        onClick={onScan}
      >
        {isScanning ? "Scanning Network…" : "Connect & Scan Network"}
      </Button>
    </div>
  );
};
