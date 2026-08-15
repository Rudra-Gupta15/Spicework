import { api } from "@/lib/api";
import type {
  NetworkDevice,
  WifiConnection,
  WifiNetwork,
  WifiSecurity,
} from "@/types/network";

/* ── Backend response shapes (backend/routers/wifi.py, discovery.py) ────── */

interface RawWifiNetwork {
  ssid: string;
  authentication?: string;
  encryption?: string;
  signal?: string;
  has_saved_password?: boolean;
}

interface RawCurrentWifi {
  connected: boolean;
  ssid: string | null;
  band: string | null;
  channel: string | null;
  ip: string | null;
  subnet: string | null;
}

interface RawScanDevice {
  ip: string;
  computer_name?: string;
  hostname?: string;
  username?: string;
  os_name?: string;
  device_type?: string;
  port_labels?: string[];
  audit_status?: "audited" | "unaudited";
}

interface RawScanResult {
  discovered: RawScanDevice[];
  total: number;
  scanned: number;
}

/* ── Mapping helpers ──────────────────────────────────────────────────── */

/** netsh reports free-form authentication strings; fold them onto the UI's set. */
const mapSecurity = (authentication?: string): WifiSecurity => {
  const value = (authentication ?? "").toLowerCase();
  if (value.includes("wpa3")) return "WPA3";
  if (value.includes("enterprise")) return "WPA2-Enterprise";
  if (value.includes("open") || value === "") return "Open";
  return "WPA2-Personal";
};

/** `"72%"` -> 3 bars (1 weakest, 4 strongest). */
const mapSignal = (signal?: string): number => {
  const pct = parseInt(signal ?? "0", 10);
  if (Number.isNaN(pct) || pct <= 0) return 1;
  if (pct <= 25) return 1;
  if (pct <= 50) return 2;
  if (pct <= 75) return 3;
  return 4;
};

const slugify = (ssid: string): string =>
  ssid.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "network";

const toWifiNetwork = (raw: RawWifiNetwork): WifiNetwork => ({
  id: slugify(raw.ssid),
  ssid: raw.ssid,
  security: mapSecurity(raw.authentication),
  signal: mapSignal(raw.signal),
});

const NOT_AVAILABLE = "Not available";

/* ── API calls ────────────────────────────────────────────────────────── */

/** GET /wifi/networks — nearby access points visible to the host running the backend. */
export const fetchWifiNetworks = async (): Promise<WifiNetwork[]> => {
  const data = await api.get<{ networks: RawWifiNetwork[] }>("/wifi/networks");
  return data.networks.map(toWifiNetwork);
};

/** GET /wifi/current — the connection the backend host is currently on, if any. */
export const fetchCurrentWifi = () => api.get<RawCurrentWifi>("/wifi/current");

/**
 * Combines /wifi/current with the matching row from /wifi/networks (for the
 * fields — encryption, signal — that /wifi/current alone doesn't report).
 */
export const resolveConnection = (
  current: RawCurrentWifi,
  networks: WifiNetwork[],
): WifiConnection | null => {
  if (!current.connected || !current.ssid) return null;

  const network = networks.find((item) => item.ssid === current.ssid);

  return {
    ipAddress: current.ip ?? NOT_AVAILABLE,
    macAddress: NOT_AVAILABLE,
    security: network?.security ?? "WPA2-Personal",
    speed: current.band && current.channel
      ? `${current.band} · Channel ${current.channel}`
      : NOT_AVAILABLE,
  };
};

/** POST /wifi/connect — joins an access point; the backend persists the credential. */
export const connectToWifi = (ssid: string, password: string) =>
  api.post<{ status: string; ssid: string; ip?: string; subnet?: string; message?: string }>(
    "/wifi/connect",
    { ssid, password },
  );

const toNetworkDevice = (raw: RawScanDevice): NetworkDevice => ({
  id: raw.ip,
  ipAddress: raw.ip,
  hostname: raw.computer_name || raw.hostname || raw.device_type || "Unknown Device",
  username: raw.username || "Unaudited Target",
  os: raw.os_name || raw.device_type || "Unknown",
  openPorts: raw.port_labels?.length ? raw.port_labels.join(", ") : "—",
  status: raw.audit_status === "audited" ? "Audited" : "Unaudited",
});

/** GET /wifi/scan-devices — sweeps the given (or current) subnet for live hosts. */
export const scanConnectedDevices = async (subnet?: string): Promise<NetworkDevice[]> => {
  const query = subnet ? `?subnet=${encodeURIComponent(subnet)}` : "";
  const data = await api.get<RawScanResult>(`/wifi/scan-devices${query}`);
  return data.discovered.map(toNetworkDevice);
};

/** Applies the "Filter by IP, Hostname, Username, OS…" box. */
export const filterDevices = (
  devices: NetworkDevice[],
  search: string,
): NetworkDevice[] => {
  const term = search.trim().toLowerCase();
  if (!term) return devices;

  return devices.filter((device) =>
    `${device.ipAddress} ${device.hostname} ${device.username} ${device.os}`
      .toLowerCase()
      .includes(term),
  );
};
