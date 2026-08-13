export type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface HardwareDevice {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  serialNumber: string;
  status: DeviceStatus;
  lastScan: string;
  ipAddress: string;
  osVersion: string;
  location: string;
  assignedTo: string;
}

/** Every column the inventory table can show. */
export type HardwareColumnKey = Exclude<keyof HardwareDevice, "id">;

/** Active values of the hardware filter bar. */
export interface HardwareFilterState {
  search: string;
  type: string;
  status: string;
  manufacturer: string;
}
