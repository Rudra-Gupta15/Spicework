import { ALL_TIME, isDateRangeActive, matchesDateRange } from "@/lib/dateRange";
import type {
  HardwareColumnKey,
  HardwareDevice,
  HardwareFilterState,
} from "@/types/hardware";

import { ADMIN_SITES } from "./admin";

/** Mock data — swap these exports for API responses later. */

/**
 * Reported device count — the table only holds the current page of it.
 * Summed from what stands at each site, so the inventory and the dashboard
 * tile can never quote different totals for the same estate.
 */
export const TOTAL_DEVICES = ADMIN_SITES.reduce(
  (sum, site) => sum + site.devices,
  0,
);

/**
 * Devices stand at the organization's own sites, so the names below come
 * from that list rather than being typed out again and drifting from it.
 */
const siteName = (index: number): string =>
  ADMIN_SITES[index % ADMIN_SITES.length].name;

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
    location: siteName(0),
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
    location: siteName(1),
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
    location: siteName(0),
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
    location: siteName(2),
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
    location: siteName(3),
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
    location: siteName(4),
    assignedTo: "Rohit Mehta",
  },
];

const ALL = "All";

export interface HardwareFilterOptions {
  type: string[];
  status: string[];
  manufacturer: string[];
}

/**
 * Dropdown options derived from the *loaded* devices, so they always match the
 * live data instead of the mock list. Mirrors softwareFilterOptions — pass the
 * devices the page actually fetched. Blanks are dropped and values sorted so
 * the menus stay tidy.
 */
export const hardwareFilterOptions = (
  devices: HardwareDevice[],
): HardwareFilterOptions => {
  const distinct = (pick: (device: HardwareDevice) => string): string[] => [
    ALL,
    ...[...new Set(devices.map(pick).filter(Boolean))].sort(),
  ];
  return {
    type: distinct((device) => device.type),
    status: distinct((device) => device.status),
    manufacturer: distinct((device) => device.manufacturer),
  };
};

export const DEFAULT_FILTERS: HardwareFilterState = {
  search: "",
  type: ALL,
  status: ALL,
  manufacturer: ALL,
  lastScan: ALL_TIME,
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
  filters.manufacturer !== ALL ||
  isDateRangeActive(filters.lastScan);

/** Applies the filter bar to the device list. */
export const filterDevices = (
  devices: HardwareDevice[],
  { search, type, status, manufacturer, lastScan }: HardwareFilterState,
): HardwareDevice[] => {
  const term = search.trim().toLowerCase();

  return devices.filter(
    (device) =>
      (type === ALL || device.type === type) &&
      (status === ALL || device.status === status) &&
      (manufacturer === ALL || device.manufacturer === manufacturer) &&
      matchesDateRange(device.lastScan, lastScan) &&
      (term === "" ||
        `${device.name} ${device.manufacturer} ${device.serialNumber} ${device.osVersion}`
          .toLowerCase()
          .includes(term)),
  );
};


/* --- writes ------------------------------------------------------- */

/**
 * The inventory is a plain module-level array, the same way the admin area
 * holds its sites and users: a create or an edit mutates it in place, so
 * every screen that reads it on mount picks the change up without a store in
 * between. A bulk upload writes through these two and nothing else.
 */

/** The serial number is an asset identity, so it is what a lookup goes by. */
export const findDeviceBySerial = (
  serialNumber: string,
): HardwareDevice | undefined => {
  const wanted = serialNumber.trim().toLowerCase();
  return HARDWARE_DEVICES.find(
    (device) => device.serialNumber.trim().toLowerCase() === wanted,
  );
};

/** `SN-DL5420-3891` becomes `sn-dl5420-3891`, with collisions numbered off. */
const deviceIdFor = (serialNumber: string): string => {
  const base =
    serialNumber
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "asset";

  let id = base;
  let suffix = 2;

  while (HARDWARE_DEVICES.some((device) => device.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  return id;
};

/** Stands in for anything only a scan can tell us. */
const UNKNOWN = "—";

/** What a row without an owner becomes — the value the table already uses. */
export const UNASSIGNED = "Unassigned";

/** Everything a caller has to say to put an asset on the books. */
export type NewDevice = Pick<
  HardwareDevice,
  "name" | "type" | "manufacturer" | "serialNumber" | "location" | "assignedTo"
> &
  Partial<Pick<HardwareDevice, "fields">>;

/**
 * An asset entered by hand has never been contacted by the agent, so it
 * lands offline with nothing scanned on it — the first scan fills the rest
 * in. Newest first, so somebody who has just uploaded a file sees it.
 */
export const addDevice = (draft: NewDevice): HardwareDevice => {
  const device: HardwareDevice = {
    ...draft,
    id: deviceIdFor(draft.serialNumber),
    status: "OFFLINE",
    lastScan: "Never",
    ipAddress: UNKNOWN,
    osVersion: UNKNOWN,
  };

  HARDWARE_DEVICES.unshift(device);
  return device;
};

/**
 * Applies what a caller actually said. Anything left undefined is left
 * alone, so an update carries only the columns its file bothered to include
 * rather than clearing the rest of the record on its way past.
 */
export const updateDevice = (
  id: string,
  changes: Partial<Omit<HardwareDevice, "id">>,
): HardwareDevice | undefined => {
  const device = HARDWARE_DEVICES.find((entry) => entry.id === id);
  if (!device) return undefined;

  Object.entries(changes).forEach(([key, value]) => {
    if (value !== undefined)
      (device as unknown as Record<string, unknown>)[key] = value;
  });

  return device;
};
