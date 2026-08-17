import type {
  DetailField,
  DeviceHardwareSpec,
  DeviceOverview,
  HardwareDevice,
} from "@/types/hardware";

import { ADMIN_SITES, ORGANIZATION } from "./admin";

/** Tabs on the device detail screen — Overview is the only one with data. */
export const DEVICE_TABS = [
  "Overview",
  "Hardware",
  "Storage",
  "Network",
  "Peripherals",
  "Printers",
  "Connected Devices",
  "Video/GPU",
  "Users",
  "Lifecycle",
  "Logs",
] as const;

export type DeviceTab = (typeof DEVICE_TABS)[number];

/** Describes one cell of a detail grid in terms of a values record. */
interface FieldSpec<T> {
  key: keyof T & string;
  label: string;
  /** Key of the fine-print line shown under the value. */
  noteKey?: keyof T & string;
  dot?: boolean;
}

const buildFields = <T extends Record<string, string>>(
  spec: FieldSpec<T>[],
  values: T,
): DetailField[] =>
  spec.map(({ key, label, noteKey, dot }) => ({
    key,
    label,
    value: values[key],
    note: noteKey ? values[noteKey] || undefined : undefined,
    dot,
  }));

/**
 * Overview layout: four fields per row, in this order. Changing the order
 * here re-flows the grid — the page never hard-codes a label.
 */
const OVERVIEW_FIELDS: FieldSpec<DeviceOverview>[] = [
  { key: "scannerName", label: "Scanner Name" },
  { key: "site", label: "Site" },
  { key: "organization", label: "Organization" },
  { key: "deviceName", label: "Device Name" },

  { key: "description", label: "Description" },
  { key: "operatingSystem", label: "Operating System" },
  { key: "manufacturerModel", label: "Manufacturer / Model" },
  { key: "domain", label: "Domain" },

  { key: "domainRole", label: "Domain Role" },
  { key: "location", label: "Location" },
  { key: "publicIp", label: "Public IP" },
  { key: "assetTag", label: "Asset Tag" },

  { key: "lastBootTime", label: "Last Boot Time" },
  { key: "systemStatus", label: "System Status", dot: true },
  { key: "uptime", label: "Uptime" },
  { key: "lastShutdown", label: "Last Shutdown" },

  { key: "lastBackup", label: "Last Backup" },
  { key: "lastLogin", label: "Last Login" },
  { key: "security", label: "Security & Antivirus" },
  { key: "lastScan", label: "Last Scan" },

  { key: "licenseStatus", label: "License Status" },
  { key: "printers", label: "Printers" },
];

/** The site a device stands at, so its address can be shown alongside. */
const siteFor = (device: HardwareDevice) =>
  ADMIN_SITES.find((site) => site.name === device.location);

/** Values every device shares, or that can be read off the row itself. */
const derive = (device: HardwareDevice): DeviceOverview => ({
  scannerName: "Prevoyance Inspection v3.0.0 (Windows Scheduled Agent)",
  site: device.location,
  organization: ORGANIZATION.name,
  deviceName: device.name,
  description: "AT/AT COMPATIBLE",
  operatingSystem: device.osVersion,
  manufacturerModel: `${device.manufacturer} ${device.type}\nS/N: ${device.serialNumber}`,
  domain: "WORKGROUP",
  domainRole: "Standalone Workstation",
  /* `site` above already names the office; this is where that office is. */
  location: siteFor(device)?.location ?? device.location,
  publicIp: device.ipAddress,
  assetTag: "Unknown",
  lastBootTime: "Unknown",
  systemStatus: `Last seen ${device.lastScan}`,
  uptime: "Unknown",
  lastShutdown: "Unknown",
  lastBackup: "No backup recorded",
  lastLogin: device.assignedTo,
  security: "Windows Defender",
  lastScan: device.lastScan,
  licenseStatus: "Licensed",
  printers: "None connected",
});

/** Per-device values the row itself does not carry. Mock data. */
const OVERRIDES: Record<string, Partial<DeviceOverview>> = {
  "laptop-bml": {
    operatingSystem:
      "Microsoft Windows 11 Home Single Language\nBuild 10.0.26200",
    publicIp: "219.91.171.134",
    lastBootTime: "2026-07-30 11:25:37",
    systemStatus: "Last seen 30-Jul-2026_12:36:32",
    uptime: "0d 1h 11m",
    lastShutdown: "2026-07-30 11:25:20",
    lastBackup: "2026-07-30 11:36:23 (Shadow Copy)",
    lastLogin: "programmershubham755@gmail.com — 2026-07-30 11:43:15",
    security: "Windows Defender,Norton Security Ultra",
    lastScan: "30-Jul-2026_12:36:32",
    printers: "1 connected",
  },
  "asus-rog": {
    domain: "PREVOYANCE.LOCAL",
    domainRole: "Member Workstation",
    publicIp: "103.21.58.9",
    lastBootTime: "2026-07-30 08:14:02",
    systemStatus: "Last seen 30-Jul-2026_09:52:10",
    uptime: "0d 1h 38m",
    lastShutdown: "2026-07-29 20:41:55",
    lastBackup: "2026-07-29 22:10:04 (Shadow Copy)",
    lastLogin: "alex.rivera@prevoyancesolutions.com — 2026-07-30 08:16:44",
    security: "Windows Defender,Malwarebytes",
    assetTag: "PS-LT-0847",
    printers: "2 connected",
  },
  "dell-latitude": {
    domain: "PREVOYANCE.LOCAL",
    domainRole: "Member Workstation",
    publicIp: "45.118.132.77",
    lastBootTime: "2026-07-28 09:02:31",
    systemStatus: "Last seen 28-Jul-2026_18:04:12",
    uptime: "0d 9h 2m",
    lastShutdown: "2026-07-28 18:05:47",
    lastBackup: "2026-07-27 23:00:11 (Shadow Copy)",
    lastLogin: "priya.sharma@prevoyancesolutions.com — 2026-07-28 09:05:20",
    security: "Windows Defender,Sophos Endpoint",
    assetTag: "PS-LT-3891",
  },
  "macbook-pro": {
    description: "Apple Silicon Workstation",
    domain: "N/A",
    domainRole: "Standalone Workstation",
    publicIp: "182.70.14.203",
    lastBootTime: "2026-07-29 07:48:19",
    systemStatus: "Last seen 29-Jul-2026_19:22:40",
    uptime: "0d 11h 34m",
    lastShutdown: "2026-07-28 21:12:05",
    lastBackup: "2026-07-29 02:00:00 (Time Machine)",
    lastLogin: "jane.doe@prevoyancesolutions.com — 2026-07-29 07:50:31",
    security: "XProtect,CrowdStrike Falcon",
    assetTag: "PS-LT-7742",
  },
  "hp-laserjet": {
    description: "Network Print Device",
    domain: "N/A",
    domainRole: "Network Peripheral",
    publicIp: "45.118.132.77",
    lastBootTime: "2026-07-25 06:30:00",
    systemStatus: "Last seen 25-Jul-2026_17:12:09",
    uptime: "5d 4h 42m",
    lastShutdown: "2026-07-20 06:28:11",
    lastBackup: "Not applicable",
    lastLogin: "Not applicable",
    security: "Not applicable",
    assetTag: "PS-PR-5523",
    licenseStatus: "Not applicable",
    printers: "Self",
  },
  "cisco-catalyst": {
    description: "Managed Layer 3 Switch",
    domain: "N/A",
    domainRole: "Network Infrastructure",
    publicIp: "14.99.201.6",
    lastBootTime: "2026-07-20 02:15:44",
    systemStatus: "Last seen 20-Jul-2026_11:47:52",
    uptime: "31d 9h 32m",
    lastShutdown: "2026-06-19 02:11:09",
    lastBackup: "2026-07-19 23:45:00 (Config Archive)",
    lastLogin: "netops@prevoyancesolutions.com — 2026-07-20 09:31:02",
    security: "Cisco TrustSec",
    assetTag: "PS-SW-1104",
    printers: "None connected",
  },
};

/** Hardware layout: four fields per row, in this order. */
const HARDWARE_FIELDS: FieldSpec<DeviceHardwareSpec>[] = [
  { key: "processor", label: "Processor (CPU)" },
  { key: "processorCount", label: "Number of Processors" },
  { key: "processorType", label: "Processor Type" },
  { key: "memory", label: "Memory (RAM)" },

  { key: "memorySlots", label: "Memory Slots", noteKey: "memorySlotsNote" },
  { key: "totalStorage", label: "Total Storage" },
  { key: "biosVersion", label: "BIOS Version" },
  { key: "biosDate", label: "BIOS Date" },
];

/** Filled in for anything the scan could not read off the device. */
const HARDWARE_DEFAULTS: DeviceHardwareSpec = {
  processor: "Unknown",
  processorCount: "Unknown",
  processorType: "Unknown",
  memory: "Unknown",
  memorySlots: "Unknown",
  memorySlotsNote: "",
  totalStorage: "Unknown",
  biosVersion: "Unknown",
  biosDate: "Unknown",
};

const HARDWARE_SPECS: Record<string, Partial<DeviceHardwareSpec>> = {
  "laptop-bml": {
    processor: "13th Gen Intel(R) Core(TM) i5-13450HX",
    processorCount: "16",
    processorType: "13th Gen Intel(R) Core(TM) i5-13450HX",
    memory: "7.60 GB",
    memorySlots: "Total 7.60 GB (per-slot detail requires root)",
    memorySlotsNote:
      "Slots: Unknown (requires root) | Current: 7.60 GB | Max: Unknown (requires root)",
    totalStorage: "/dev/sdd 947G free of 1007G",
    biosVersion: "ASCN51WWASCN51WW",
    biosDate: "05/14/2021",
  },
  "asus-rog": {
    processor: "AMD Ryzen 9 8945HS with Radeon 780M",
    processorCount: "16",
    processorType: "AMD Ryzen 9 8945HS with Radeon 780M",
    memory: "32.00 GB",
    memorySlots: "Total 32.00 GB (soldered, non-upgradable)",
    memorySlotsNote: "Slots: 0 usable | Current: 32.00 GB | Max: 32.00 GB",
    totalStorage: "/dev/nvme0n1 612G free of 1024G",
    biosVersion: "GA403UV.318",
    biosDate: "03/22/2024",
  },
  "dell-latitude": {
    processor: "11th Gen Intel(R) Core(TM) i7-1185G7",
    processorCount: "8",
    processorType: "11th Gen Intel(R) Core(TM) i7-1185G7",
    memory: "16.00 GB",
    memorySlots: "Total 16.00 GB across 2 slots",
    memorySlotsNote: "Slots: 2 of 2 used | Current: 16.00 GB | Max: 64.00 GB",
    totalStorage: "/dev/sda 214G free of 512G",
    biosVersion: "DELL 1.24.0",
    biosDate: "09/08/2023",
  },
  "macbook-pro": {
    processor: "Apple M3 Pro",
    processorCount: "12",
    processorType: "Apple Silicon (6P + 6E)",
    memory: "18.00 GB",
    memorySlots: "Total 18.00 GB (unified memory)",
    memorySlotsNote: "Slots: Not applicable | Current: 18.00 GB | Max: 18.00 GB",
    totalStorage: "/dev/disk3s1 402G free of 994G",
    biosVersion: "iBoot 10151.121.1",
    biosDate: "01/17/2024",
  },
  "hp-laserjet": {
    processor: "HP LaserJet Formatter 800 MHz",
    processorCount: "1",
    processorType: "Embedded ARM Controller",
    memory: "512 MB",
    memorySlots: "Total 512 MB (embedded)",
    memorySlotsNote: "Slots: Not applicable | Current: 512 MB | Max: 512 MB",
    totalStorage: "Internal flash 1.2G free of 2.0G",
    biosVersion: "Firmware 4.2.1",
    biosDate: "06/02/2023",
  },
  "cisco-catalyst": {
    processor: "Cisco Catalyst ARMv8 Processor",
    processorCount: "4",
    processorType: "Embedded Switching ASIC + ARMv8",
    memory: "8.00 GB",
    memorySlots: "Total 8.00 GB (soldered)",
    memorySlotsNote: "Slots: Not applicable | Current: 8.00 GB | Max: 8.00 GB",
    totalStorage: "flash: 1.6G free of 4.0G",
    biosVersion: "IOS XE 17.9.4a",
    biosDate: "11/12/2023",
  },
};

/** Label/value pairs for a device's Overview tab, ready to render. */
export const getDeviceOverview = (device: HardwareDevice): DetailField[] =>
  buildFields(OVERVIEW_FIELDS, { ...derive(device), ...OVERRIDES[device.id] });

/** Label/value pairs for a device's Hardware tab, ready to render. */
export const getDeviceHardware = (device: HardwareDevice): DetailField[] =>
  buildFields(HARDWARE_FIELDS, {
    ...HARDWARE_DEFAULTS,
    ...HARDWARE_SPECS[device.id],
  });

export interface DeviceTabPanel {
  /** Card heading for the tab. */
  title: string;
  fields: DetailField[];
}

/** Panel for a tab, or `null` while that tab has no data to show. */
export const getTabPanel = (
  device: HardwareDevice,
  tab: DeviceTab,
): DeviceTabPanel | null => {
  switch (tab) {
    case "Overview":
      return { title: "Overview", fields: getDeviceOverview(device) };
    case "Hardware":
      return { title: "Hardware Details", fields: getDeviceHardware(device) };
    default:
      return null;
  }
};
