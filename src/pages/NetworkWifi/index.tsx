import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ConnectedDevicesCard } from "@/components/network/ConnectedDevicesCard";
import { ConnectWifiModal } from "@/components/network/ConnectWifiModal";
import { CurrentConnectionPanel } from "@/components/network/CurrentConnectionPanel";
import { WifiNetworkList } from "@/components/network/WifiNetworkList";
import { Navbar } from "@/components/layout/Navbar";
import { SectionCard } from "@/components/ui";
import {
  ACTIVE_NETWORK_ID,
  TOTAL_SCANNED_DEVICES,
  WIFI_NETWORKS,
  filterDevices,
  getConnection,
  scanDevices,
  subnetLabel,
} from "@/data/network";
import { downloadCsv } from "@/lib/csv";
import type { NetworkDevice, WifiNetwork } from "@/types/network";

/** How long the mock sweep runs before it reports back. */
const SCAN_DURATION_MS = 900;

const CSV_HEADERS = [
  "IP Address",
  "Hostname / Device",
  "Username",
  "Operating System",
  "Open Ports",
  "Status",
];

const NetworkWifiPage = () => {
  const [activeId, setActiveId] = useState(ACTIVE_NETWORK_ID);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setScanning] = useState(false);
  const [search, setSearch] = useState("");
  /* The network waiting on the password prompt. */
  const [pending, setPending] = useState<WifiNetwork | null>(null);
  const [notified, setNotified] = useState<ReadonlySet<string>>(new Set());

  const scanTimer = useRef<number | null>(null);

  const cancelScan = useCallback(() => {
    if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
    scanTimer.current = null;
  }, []);

  /* A pending sweep must not land after the page is gone. */
  useEffect(() => cancelScan, [cancelScan]);

  const network = useMemo(
    () => WIFI_NETWORKS.find((item) => item.id === activeId),
    [activeId],
  );

  const connection = useMemo(() => getConnection(network), [network]);

  const visibleDevices = useMemo(
    () => filterDevices(devices, search),
    [devices, search],
  );

  /* Unfiltered, the table is the first page of everything the sweep saw. */
  const summary = useMemo(() => {
    if (!hasScanned || !connection) return "0 devices";

    if (search.trim()) {
      return `${visibleDevices.length} of ${TOTAL_SCANNED_DEVICES} devices match this filter`;
    }

    return `${TOTAL_SCANNED_DEVICES} devices active on subnet ${subnetLabel(connection)}`;
  }, [hasScanned, connection, search, visibleDevices.length]);

  /* Joining an access point drops the results of the previous sweep. */
  const connectNetwork = useCallback(
    (next: WifiNetwork) => {
      cancelScan();
      setActiveId(next.id);
      setDevices([]);
      setHasScanned(false);
      setScanning(false);
      setSearch("");
      setPending(null);
      setNotified(new Set());
    },
    [cancelScan],
  );

  const notifyDevice = useCallback((device: NetworkDevice) => {
    setNotified((current) => new Set(current).add(device.id));
  }, []);

  const runScan = useCallback(() => {
    if (!connection || isScanning) return;

    setScanning(true);
    cancelScan();

    scanTimer.current = window.setTimeout(() => {
      setDevices(scanDevices(connection));
      setHasScanned(true);
      setScanning(false);
      scanTimer.current = null;
    }, SCAN_DURATION_MS);
  }, [connection, isScanning, cancelScan]);

  const exportCsv = useCallback(() => {
    downloadCsv(
      `network-devices-${activeId}.csv`,
      CSV_HEADERS,
      visibleDevices.map((device) => [
        device.ipAddress,
        device.hostname,
        device.username,
        device.os,
        device.openPorts,
        device.status,
      ]),
    );
  }, [activeId, visibleDevices]);

  return (
    <>
      <Navbar
        title="Network WiFi"
        subtitle="Manage and scan corporate office wireless infrastructure."
        actions={
          <span className="rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-heading">
            Status: {connection ? "Connected" : "Not connected"}
          </span>
        }
      />

      <div className="mt-6 space-y-6">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <SectionCard title="Available WiFi Networks">
            <WifiNetworkList
              networks={WIFI_NETWORKS}
              activeId={activeId}
              onSelect={setPending}
            />
          </SectionCard>

          <SectionCard title="Current Connection">
            {network && connection ? (
              <CurrentConnectionPanel
                network={network}
                connection={connection}
                isScanning={isScanning}
                onScan={runScan}
              />
            ) : (
              <p className="text-sm text-muted">
                This access point is out of range — pick another network to see
                its connection details.
              </p>
            )}
          </SectionCard>
        </section>

        <ConnectedDevicesCard
          devices={visibleDevices}
          summary={summary}
          search={search}
          onSearchChange={setSearch}
          onRescan={runScan}
          onExport={exportCsv}
          notified={notified}
          onNotify={notifyDevice}
          isScanning={isScanning}
          canRescan={hasScanned}
        />
      </div>

      <ConnectWifiModal
        key={pending?.id}
        network={pending}
        onCancel={() => setPending(null)}
        onConnect={connectNetwork}
      />
    </>
  );
};

export default NetworkWifiPage;
