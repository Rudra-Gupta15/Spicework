import { CalendarClock, Monitor, Wifi, WifiOff } from "lucide-react";

import type { StatMetric } from "@/types/ui";
import type { HardwareDevice, HardwareFilterState } from "@/types/hardware";

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

export const HARDWARE_DEVICES: HardwareDevice[] = [
  {
    id: "asus-rog",
    name: "ASUS ROG Zephyrus G14",
    type: "Laptop",
    manufacturer: "ASUS",
    serialNumber: "SN-G14-2024-0847",
    status: "ONLINE",
    lastScan: "Jul 30 2026",
  },
  {
    id: "dell-latitude",
    name: "Dell Latitude 5420",
    type: "Laptop",
    manufacturer: "Dell Inc.",
    serialNumber: "SN-DL5420-3891",
    status: "OFFLINE",
    lastScan: "Jul 28 2026",
  },
  {
    id: "macbook-pro",
    name: "MacBook Pro M3",
    type: "Laptop",
    manufacturer: "Apple Inc.",
    serialNumber: "SN-MBP-M3-7742",
    status: "ONLINE",
    lastScan: "Jul 29 2026",
  },
  {
    id: "hp-laserjet",
    name: "HP LaserJet Pro",
    type: "Printer",
    manufacturer: "HP Inc.",
    serialNumber: "SN-HP-LJ-5523",
    status: "ONLINE",
    lastScan: "Jul 25 2026",
  },
  {
    id: "cisco-catalyst",
    name: "Cisco Catalyst 9200",
    type: "Switch",
    manufacturer: "Cisco Systems",
    serialNumber: "SN-CC9200-1104",
    status: "MAINTENANCE",
    lastScan: "Jul 20 2026",
  },
  {
    id: "laptop-bml",
    name: "LAPTOP-BML1A93C",
    type: "Laptop",
    manufacturer: "Acer Aspire A715-75G",
    serialNumber: "NHQ97SI0011211CD8E3400",
    status: "ONLINE",
    lastScan: "Jul 30 2026",
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
