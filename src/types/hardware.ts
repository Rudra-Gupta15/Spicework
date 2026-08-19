import type { AssetFieldValues } from "./assetFields";

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
  /**
   * What a person filled in rather than the agent — owner, location,
   * lifecycle, purchase, warranty and the organization's own columns. Absent
   * on a device nobody has recorded anything against yet.
   */
  fields?: AssetFieldValues;
}

/** Every column the inventory table can show. */
export type HardwareColumnKey = Exclude<keyof HardwareDevice, "id" | "fields">;

/** Active values of the hardware filter bar. */
export interface HardwareFilterState {
  search: string;
  type: string;
  status: string;
  manufacturer: string;
}

/** Every value shown on a device's Overview tab, in display order. */
export interface DeviceOverview {
  scannerName: string;
  site: string;
  organization: string;
  deviceName: string;
  description: string;
  operatingSystem: string;
  manufacturerModel: string;
  domain: string;
  domainRole: string;
  location: string;
  publicIp: string;
  assetTag: string;
  lastBootTime: string;
  systemStatus: string;
  uptime: string;
  lastShutdown: string;
  lastBackup: string;
  lastLogin: string;
  security: string;
  lastScan: string;
  licenseStatus: string;
  printers: string;
}

/** Every value shown on a device's Hardware tab, in display order. */
export interface DeviceHardwareSpec {
  processor: string;
  processorCount: string;
  processorType: string;
  memory: string;
  memorySlots: string;
  /** Fine print under the memory slot summary. */
  memorySlotsNote: string;
  totalStorage: string;
  biosVersion: string;
  biosDate: string;
}

/** Headline figures above the disk table on the Storage tab. */
export interface DiskSummary {
  totalStorage: string;
  used: string;
  free: string;
  ssdCount: number;
  ssdSize: string;
  hddCount: number;
  hddSize: string;
  physicalDisks: number;
}

/** One physical disk reported by the scan. */
export interface Disk {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  interface: string;
  fileSystem: string;
  size: string;
  used: string;
}

/** One partition on a reported disk. */
export interface DiskPartition {
  id: string;
  name: string;
  totalSize: string;
  used: string;
  freeSpace: string;
  fileSystem: string;
  bootable: string;
}

export interface DeviceStorage {
  summary: DiskSummary;
  disks: Disk[];
  partitions: DiskPartition[];
}

/** One network interface reported by the scan. */
export interface NetworkAdapter {
  id: string;
  name: string;
  description: string;
  macAddress: string;
  ipv4: string;
  ipv6: string;
  subnetMask: string;
  gateway: string;
  dnsDomain: string;
  dnsServers: string;
  dhcpServer: string;
  mtu: string;
  speed: string;
  type: string;
}

/** One peripheral the scan reported as attached. */
export interface Peripheral {
  id: string;
  /** Scan-assigned number — gaps are expected, so it is not a row counter. */
  sequence: number;
  /** Device class shown as a pill (Bluetooth, USB, Mouse, HIDClass…). */
  type: string;
  name: string;
  description: string;
  manufacturer: string;
  version: string;
}

/** One printer the scan found attached to the device. */
export interface Printer {
  id: string;
  sequence: number;
  name: string;
  systemName: string;
  portName: string;
  status: string;
  bidirectional: string;
}

/** How a device is physically attached — drives the filter chips. */
export type ConnectedVia =
  | "Bluetooth"
  | "Drive Bus"
  | "HID (USB/Bluetooth)"
  | "Internal Panel"
  | "Other"
  | "PCI / PCIe Slot"
  | "USB"
  | "USB Storage";

/** One entry in the "All Connected Devices" list. */
export interface ConnectedDevice {
  id: string;
  sequence: number;
  name: string;
  /** Windows device class (Net, Display, HIDClass…). */
  category: string;
  via: ConnectedVia;
  port: string;
  manufacturer: string;
  serial: string;
  status: string;
}

/** One video controller / GPU reported by the scan. */
export interface VideoController {
  id: string;
  sequence: number;
  name: string;
  adapterName: string;
  videoProcessor: string;
  driverVersion: string;
}

/**
 * One local account found on the device. `licensed` and `currentUser` are
 * only surfaced on the software side; the hardware tab omits them.
 */
export interface UserAccount {
  id: string;
  sequence: number;
  username: string;
  homeDirectory: string;
  lastLogin: string;
  userType: string;
  licensed: string;
  currentUser: string;
}

/** One sign-in event reported by the scan. */
export interface LoginRecord {
  id: string;
  sequence: number;
  user: string;
  domain: string;
  logonType: string;
  timestamp: string;
}

/** One application the scan found installed on the device. */
export interface InstalledApp {
  id: string;
  sequence: number;
  name: string;
  version: string;
  publisher: string;
  /** Reported as a `YYYYMMDD` string, or "Unknown". */
  installDate: string;
  size: string;
  lastUsed: string;
}

/** One label/value pair rendered in a detail grid. */
export interface DetailField {
  key: string;
  label: string;
  /** `\n` forces a line break; anything longer simply wraps. */
  value: string;
  /** Smaller muted line under the value. */
  note?: string;
  /** Renders a status dot before the value. */
  dot?: boolean;
}
