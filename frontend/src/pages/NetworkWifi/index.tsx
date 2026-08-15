import { useCallback, useEffect, useMemo, useState } from "react";

import { ConnectedDevicesCard } from "@/components/network/ConnectedDevicesCard";
import { ConnectWifiModal } from "@/components/network/ConnectWifiModal";
import { CurrentConnectionPanel } from "@/components/network/CurrentConnectionPanel";
import { WifiNetworkList } from "@/components/network/WifiNetworkList";
import { Navbar } from "@/components/layout/Navbar";
import { SectionCard } from "@/components/ui";
import {
  connectToWifi,
  fetchCurrentWifi,
  fetchWifiNetworks,
  filterDevices,
  resolveConnection,
  scanConnectedDevices,
} from "@/data/network";
import { ApiError } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import type { NetworkDevice, WifiNetwork } from "@/types/network";

const CSV_HEADERS = [
  "IP Address",
  "Hostname / Device",
  "Username",
  "Operating System",
  "Open Ports",
  "Status",
];

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

const NetworkWifiPage = () => {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [currentSsid, setCurrentSsid] = useState<string | null>(null);
  const [currentIp, setCurrentIp] = useState<string | null>(null);
  const [currentSubnet, setCurrentSubnet] = useState<string | null>(null);
  const [currentBand, setCurrentBand] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();

  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string>();
  const [search, setSearch] = useState("");

  const [pending, setPending] = useState<WifiNetwork | null>(null);
  const [isConnecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string>();

  const [notified, setNotified] = useState<ReadonlySet<string>>(new Set());

  const loadWifiState = useCallback(async () => {
    setLoading(true);
    setLoadError(undefined);
    try {
      const [networkList, current] = await Promise.all([
        fetchWifiNetworks(),
        fetchCurrentWifi(),
      ]);
      setNetworks(networkList);
      setConnected(current.connected);
      setCurrentSsid(current.ssid);
      setCurrentIp(current.ip);
      setCurrentSubnet(current.subnet);
      setCurrentBand(current.band);
      setCurrentChannel(current.channel);
    } catch (error) {
      setLoadError(errorMessage(error, "Could not reach the WiFi service."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount: loadWifiState sets a loading flag before its
    // first await, which this rule can't distinguish from a synchronous
    // render-time state update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWifiState();
  }, [loadWifiState]);

  const activeNetwork = useMemo(
    () => networks.find((item) => item.ssid === currentSsid),
    [networks, currentSsid],
  );

  const connection = useMemo(
    () =>
      resolveConnection(
        {
          connected,
          ssid: currentSsid,
          band: currentBand,
          channel: currentChannel,
          ip: currentIp,
          subnet: currentSubnet,
        },
        networks,
      ),
    [connected, currentSsid, currentBand, currentChannel, currentIp, currentSubnet, networks],
  );

  const visibleDevices = useMemo(
    () => filterDevices(devices, search),
    [devices, search],
  );

  const summary = useMemo(() => {
    if (!hasScanned || !connection) return "0 devices";
    if (search.trim()) {
      return `${visibleDevices.length} of ${devices.length} devices match this filter`;
    }
    return `${devices.length} devices active on subnet ${currentSubnet ?? "—"}`;
  }, [hasScanned, connection, search, visibleDevices.length, devices.length, currentSubnet]);

  const runScan = useCallback(async () => {
    if (!connection || isScanning) return;

    setScanning(true);
    setScanError(undefined);
    try {
      const found = await scanConnectedDevices(currentSubnet ?? undefined);
      setDevices(found);
      setHasScanned(true);
    } catch (error) {
      setScanError(errorMessage(error, "Scan failed."));
    } finally {
      setScanning(false);
    }
  }, [connection, isScanning, currentSubnet]);

  const connectNetwork = useCallback(
    async (next: WifiNetwork, password: string) => {
      setConnecting(true);
      setConnectError(undefined);
      try {
        const result = await connectToWifi(next.ssid, password);
        if (result.status === "error") {
          setConnectError(result.message ?? "Failed to connect to this network.");
          return;
        }

        setDevices([]);
        setHasScanned(false);
        setSearch("");
        setNotified(new Set());
        setPending(null);
        await loadWifiState();
      } catch (error) {
        setConnectError(errorMessage(error, "Failed to connect to this network."));
      } finally {
        setConnecting(false);
      }
    },
    [loadWifiState],
  );

  const notifyDevice = useCallback((device: NetworkDevice) => {
    setNotified((current) => new Set(current).add(device.id));
  }, []);

  const exportCsv = useCallback(() => {
    downloadCsv(
      `network-devices-${activeNetwork?.id ?? "scan"}.csv`,
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
  }, [activeNetwork, visibleDevices]);

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
        {loadError && (
          <p className="rounded-lg border border-status-offline bg-red-50 px-4 py-3 text-sm text-status-offline">
            {loadError}
          </p>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <SectionCard title="Available WiFi Networks">
            {isLoading ? (
              <p className="text-sm text-muted">Scanning for nearby networks…</p>
            ) : networks.length === 0 ? (
              <p className="text-sm text-muted">
                No WiFi networks found. The backend host may not have wireless
                hardware, or is running outside a local network.
              </p>
            ) : (
              <WifiNetworkList
                networks={networks}
                activeId={activeNetwork?.id ?? ""}
                onSelect={setPending}
              />
            )}
          </SectionCard>

          <SectionCard title="Current Connection">
            {activeNetwork && connection ? (
              <CurrentConnectionPanel
                network={activeNetwork}
                connection={connection}
                isScanning={isScanning}
                onScan={() => void runScan()}
              />
            ) : (
              <p className="text-sm text-muted">
                {isLoading
                  ? "Checking connection status…"
                  : "Not connected to a network — pick one on the left to connect."}
              </p>
            )}
            {scanError && (
              <p className="mt-3 text-[13px] text-status-offline">{scanError}</p>
            )}
          </SectionCard>
        </section>

        <ConnectedDevicesCard
          devices={visibleDevices}
          summary={summary}
          search={search}
          onSearchChange={setSearch}
          onRescan={() => void runScan()}
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
        onConnect={(network, password) => void connectNetwork(network, password)}
        isConnecting={isConnecting}
        connectError={connectError}
      />
    </>
  );
};

export default NetworkWifiPage;
