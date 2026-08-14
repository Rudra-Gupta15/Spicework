/** Encryption reported by an access point. */
export type WifiSecurity =
  | "WPA3"
  | "WPA2-Enterprise"
  | "WPA2-Personal"
  | "Open";

/** One access point found by the wireless scan. */
export interface WifiNetwork {
  id: string;
  ssid: string;
  security: WifiSecurity;
  /** Signal strength, 1 (weakest) to 4 (full bars). */
  signal: number;
}

/** Link details for the network the agent is associated with. */
export interface WifiConnection {
  ipAddress: string;
  macAddress: string;
  security: WifiSecurity;
  speed: string;
}

/** Whether the host has been through an inventory audit. */
export type NetworkDeviceStatus = "Audited" | "Unaudited";

/** One host returned by "Connect & Scan Network". */
export interface NetworkDevice {
  id: string;
  ipAddress: string;
  /** Hostname reported by the host, or its device class when unnamed. */
  hostname: string;
  username: string;
  os: string;
  openPorts: string;
  status: NetworkDeviceStatus;
}
