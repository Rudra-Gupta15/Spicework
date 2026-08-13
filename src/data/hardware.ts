import { CalendarClock, Monitor, Wifi, WifiOff } from "lucide-react";

import type { StatMetric } from "@/types/ui";
import type {
  HardwareColumnKey,
  HardwareDevice,
  HardwareFilterState,
} from "@/types/hardware";

/** Mock data — swap these exports for API responses later. */

export const HARDWARE_STATS: StatMetric[] = [
  {
    id: "total",
    label: "Total Devices",
    value: "612",
    icon: Monitor,
    tone: "brand",
  },
  { id: "online", label: "Online", value: "500", icon: Wifi, tone: "brand" },
  { id: "offline", label: "Offline", value: "112", icon: WifiOff, tone: "brand" },
  {
    id: "warranty",
    label: "Warranty Expiring",
    value: "35",
    icon: CalendarClock,
    tone: "brand",
  },
];

/** Reported device count — the table only holds the current page of it. */
export const TOTAL_DEVICES = 612;

/**
 * Every column the inventory table can render. Drives both the table and
 * the "Customize Columns" dialog, so the two can never disagree.
 */
export const HARDWARE_COLUMNS: {
  key: HardwareColumnKey;
  label: string;
  /** Shown before the user customises anything. */
  visibleByDefault: boolean;
}[] = [
  { key: "name", label: "Device Name", visibleByDefault: true },
  { key: "type", label: "Type", visibleByDefault: true },
  { key: "manufacturer", label: "Manufacturer", visibleByDefault: true },
  { key: "serialNumber", label: "Serial Number", visibleByDefault: true },
  { key: "status", label: "Status", visibleByDefault: true },
  { key: "lastScan", label: "Last Scan", visibleByDefault: true },
  { key: "ipAddress", label: "IP Address", visibleByDefault: false },
  { key: "osVersion", label: "OS Version", visibleByDefault: false },
  { key: "location", label: "Location", visibleByDefault: false },
  { key: "assignedTo", label: "Assigned To", visibleByDefault: false },
];

export const DEFAULT_COLUMNS: HardwareColumnKey[] = HARDWARE_COLUMNS.filter(
  (column) => column.visibleByDefault,
).map((column) => column.key);

export const HARDWARE_DEVICES: HardwareDevice[] = [
  {
    id: "asus-rog",
    name: "ASUS ROG Zephyrus G14",
    type: "Laptop",
    manufacturer: "ASUS",
    serialNumber: "SN-G14-2024-0847",
    status: "ONLINE",
    lastScan: "Jul 30 2026",
    ipAddress: "192.168.1.22",
    osVersion: "Windows 11 Pro",
    location: "HQ - Floor 2",
    assignedTo: "Alex Rivera",
  },
  {
    id: "dell-latitude",
    name: "Dell Latitude 5420",
    type: "Laptop",
    manufacturer: "Dell Inc.",
    serialNumber: "SN-DL5420-3891",
    status: "OFFLINE",
    lastScan: "Jul 28 2026",
    ipAddress: "192.168.1.45",
    osVersion: "Windows 10 Pro",
    location: "HQ - Floor 1",
    assignedTo: "Priya Sharma",
  },
  {
    id: "macbook-pro",
    name: "MacBook Pro M3",
    type: "Laptop",
    manufacturer: "Apple Inc.",
    serialNumber: "SN-MBP-M3-7742",
    status: "ONLINE",
    lastScan: "Jul 29 2026",
    ipAddress: "192.168.1.62",
    osVersion: "macOS 14.5",
    location: "Remote",
    assignedTo: "Jane Doe",
  },
  {
    id: "hp-laserjet",
    name: "HP LaserJet Pro",
    type: "Printer",
    manufacturer: "HP Inc.",
    serialNumber: "SN-HP-LJ-5523",
    status: "ONLINE",
    lastScan: "Jul 25 2026",
    ipAddress: "192.168.1.90",
    osVersion: "Firmware 4.2.1",
    location: "HQ - Print Room",
    assignedTo: "Unassigned",
  },
  {
    id: "cisco-catalyst",
    name: "Cisco Catalyst 9200",
    type: "Switch",
    manufacturer: "Cisco Systems",
    serialNumber: "SN-CC9200-1104",
    status: "MAINTENANCE",
    lastScan: "Jul 20 2026",
    ipAddress: "10.0.1.4",
    osVersion: "IOS XE 17.9",
    location: "Data Centre A",
    assignedTo: "Network Team",
  },
  {
    id: "laptop-bml",
    name: "LAPTOP-BML1A93C",
    type: "Laptop",
    manufacturer: "Acer Aspire A715-75G",
    serialNumber: "NHQ97SI0011211CD8E3400",
    status: "ONLINE",
    lastScan: "Jul 30 2026",
    ipAddress: "192.168.1.118",
    osVersion: "Windows 11 Home",
    location: "Branch - Pune",
    assignedTo: "Rohit Mehta",
  },
];

const ALL = "All";

/** Filter options derived from the data so they never fall out of sync. */
const uniqueValues = (pick: (device: HardwareDevice) => string): string[] => [
  ALL,
  ...new Set(HARDWARE_DEVICES.map(pick)),
];

export const HARDWARE_FILTER_OPTIONS = {
  type: uniqueValues((device) => device.type),
  status: uniqueValues((device) => device.status),
  manufacturer: uniqueValues((device) => device.manufacturer),
};

export const DEFAULT_FILTERS: HardwareFilterState = {
  search: "",
  type: ALL,
  status: ALL,
  manufacturer: ALL,
};

export const SAVE_FILTER_OPTIONS = [
  "Save Filter",
  "Save as new view",
  "Manage saved filters",
];

/** True when a filter would narrow the result set. */
export const isFiltered = (filters: HardwareFilterState): boolean =>
  filters.search.trim() !== "" ||
  filters.type !== ALL ||
  filters.status !== ALL ||
  filters.manufacturer !== ALL;

/** Applies the filter bar to the device list. */
export const filterDevices = (
  devices: HardwareDevice[],
  { search, type, status, manufacturer }: HardwareFilterState,
): HardwareDevice[] => {
  const term = search.trim().toLowerCase();

  return devices.filter(
    (device) =>
      (type === ALL || device.type === type) &&
      (status === ALL || device.status === status) &&
      (manufacturer === ALL || device.manufacturer === manufacturer) &&
      (term === "" ||
        `${device.name} ${device.manufacturer} ${device.serialNumber}`
          .toLowerCase()
          .includes(term)),
  );
};
