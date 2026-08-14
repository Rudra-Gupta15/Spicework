import type {
  NetworkDevice,
  WifiConnection,
  WifiNetwork,
} from "@/types/network";

/** Mock data — swap these exports for API responses later. */

export const WIFI_NETWORKS: WifiNetwork[] = [
  { id: "igo-2g-5g", ssid: "iGO 2G/5G", security: "WPA3", signal: 4 },
  {
    id: "airtel-prof-7760",
    ssid: "Airtel_prof_7760",
    security: "WPA2-Enterprise",
    signal: 4,
  },
  {
    id: "you-2nd-floor-5",
    ssid: "You_2nd floor 5",
    security: "WPA2-Personal",
    signal: 4,
  },
  {
    id: "you-2nd-floor",
    ssid: "You_2nd floor",
    security: "WPA2-Personal",
    signal: 2,
  },
  { id: "rahmania", ssid: "Rahmania", security: "WPA2-Personal", signal: 3 },
  {
    id: "airtel-promo-1706",
    ssid: "Airtel Promo 1706",
    security: "WPA2-Personal",
    signal: 1,
  },
];

/** The access point the agent is associated with on load. */
export const ACTIVE_NETWORK_ID = "airtel-prof-7760";

/** Gateway address and adapter details, per access point. */
const CONNECTIONS: Record<string, Pick<WifiConnection, "ipAddress" | "macAddress" | "speed">> = {
  "igo-2g-5g": {
    ipAddress: "10.20.4.1",
    macAddress: "3C:71:BF:04:9A:22",
    speed: "867 Mbps",
  },
  "airtel-prof-7760": {
    ipAddress: "192.168.1.1",
    macAddress: "24:F5:A2:8B:11:0E",
    speed: "300 Mbps",
  },
  "you-2nd-floor-5": {
    ipAddress: "192.168.29.1",
    macAddress: "B0:BE:76:5C:31:A4",
    speed: "433 Mbps",
  },
  "you-2nd-floor": {
    ipAddress: "192.168.29.2",
    macAddress: "B0:BE:76:5C:31:A5",
    speed: "144 Mbps",
  },
  rahmania: {
    ipAddress: "192.168.0.1",
    macAddress: "8C:3B:AD:19:7F:60",
    speed: "216 Mbps",
  },
  "airtel-promo-1706": {
    ipAddress: "192.168.43.1",
    macAddress: "44:D9:E7:22:C8:1B",
    speed: "72 Mbps",
  },
};

/** Link details for a network, or `null` when it is out of range. */
export const getConnection = (
  network: WifiNetwork | undefined,
): WifiConnection | null => {
  if (!network) return null;

  const link = CONNECTIONS[network.id];
  if (!link) return null;

  return { ...link, security: network.security };
};

/** Hosts the sweep reports — the table only holds the first page of them. */
export const TOTAL_SCANNED_DEVICES = 20;

/** `[host suffix, hostname, username, OS, open ports, audited?]`. */
type DeviceSeed = [number, string, string, string, string, boolean?];

const DEVICE_SEEDS: DeviceSeed[] = [
  [12, "DESKTOP-6M02AJ0", "Windows Host", "Unaudited Target", "Windows Host"],
  [
    1,
    "DSLDEVICE",
    "Web Service / Network Device",
    "Unaudited Target",
    "Web Service",
  ],
  [29, "DESKTOP-7UJN1AH", "Windows Host", "Unaudited Target", "Windows Host"],
  [
    190,
    "Web Service / Network (190)",
    "Web Service / Network Device",
    "Unaudited Target",
    "Web Service",
  ],
  [
    15,
    "Intel Corporate (15)",
    "Intel Corporate Device",
    "Unaudited Target",
    "Intel Corporate Device",
  ],
  [
    18,
    "CLOUD NETWORK TECHNOLOGY (18)",
    "CLOUD NETWORK TECHNOLOGY",
    "Unaudited Target",
    "CLOUD TECHNOLOGY",
  ],
  [
    20,
    "DESKTOP-4MDOPK1",
    "Microsoft Windows 11 Pro",
    "Admin",
    "Intel Corporate Device",
    true,
  ],
  [
    33,
    "DESKTOP-K2PK72T",
    "Hon Hai Precision Ind.",
    "Unaudited Target",
    "Network Device",
  ],
];

/** `192.168.1.1` -> `192.168.1` — the /24 the gateway sits on. */
const toSubnet = (ipAddress: string): string =>
  ipAddress.split(".").slice(0, 3).join(".");

/** Range the sweep covered, e.g. `192.168.1.0/24`. */
export const subnetLabel = (connection: WifiConnection): string =>
  `${toSubnet(connection.ipAddress)}.0/24`;

/**
 * Hosts discovered on an access point's subnet. Derived from the gateway
 * address so every network reports plausible addresses of its own.
 */
export const scanDevices = (connection: WifiConnection): NetworkDevice[] => {
  const subnet = toSubnet(connection.ipAddress);

  return DEVICE_SEEDS.map(
    ([suffix, hostname, username, os, openPorts, audited]) => ({
      id: `${subnet}.${suffix}`,
      ipAddress: `${subnet}.${suffix}`,
      hostname,
      username,
      os,
      openPorts,
      status: audited ? "Audited" : "Unaudited",
    }),
  );
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
