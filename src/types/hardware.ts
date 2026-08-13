export type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface HardwareDevice {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  serialNumber: string;
  status: DeviceStatus;
  lastScan: string;
}

/** Active values of the hardware filter bar. */
export interface HardwareFilterState {
  search: string;
  type: string;
  status: string;
  manufacturer: string;
}
