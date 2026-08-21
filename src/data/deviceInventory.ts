import { Laptop, Monitor, Printer, Projector } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { HardwareDevice } from "@/types/hardware";
import type {
  DeviceAssignmentFilter,
  DeviceCategory,
  DeviceColumnKey,
  DeviceRecord,
} from "@/types/device";

/* -------------------------------------------------------------------------
 * Presentation rules for /inventory/device. The rows themselves come from
 * Postgres via `@/data/registeredDevices` — what lives here is only the
 * shape of the screen: which tabs exist, how a date reads, how a tab is
 * narrowed.
 * ---------------------------------------------------------------------- */

export interface DeviceCategoryMeta {
  id: DeviceCategory;
  icon: LucideIcon;
  /** Card heading — "Laptop Inventory". */
  title: string;
  /** Noun the pagination summary counts in — "85 laptops". */
  plural: string;
}

export const DEVICE_CATEGORIES: DeviceCategoryMeta[] = [
  { id: "Laptop", icon: Laptop, title: "Laptop Inventory", plural: "laptops" },
  { id: "Printer", icon: Printer, title: "Printer Inventory", plural: "printers" },
  {
    id: "Projector",
    icon: Projector,
    title: "Projector Inventory",
    plural: "projectors",
  },
  { id: "Desktop", icon: Monitor, title: "Desktop Inventory", plural: "desktops" },
];

/** Every column Customize View can show or hide, in display order. */
export const DEVICE_COLUMNS: {
  key: DeviceColumnKey;
  label: string;
  visibleByDefault: boolean;
}[] = [
  { key: "name", label: "Device", visibleByDefault: true },
  { key: "serialNumber", label: "Serial Number", visibleByDefault: true },
  { key: "buyDate", label: "Buy Date", visibleByDefault: true },
  { key: "currentUser", label: "Current User", visibleByDefault: true },
];

export const DEFAULT_DEVICE_COLUMNS: DeviceColumnKey[] = DEVICE_COLUMNS.filter(
  (column) => column.visibleByDefault,
).map((column) => column.key);

/** `2024-01-15` → `Jan 15, 2024`; anything unparseable is passed through. */
export const formatDeviceDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso || "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

/** The options the assignment filter offers, in the order they are listed. */
export const DEVICE_ASSIGNMENT_FILTERS: readonly DeviceAssignmentFilter[] = [
  "All",
  "Assigned",
  "Unassigned",
];

/**
 * Sample rows for Printer, Projector and Desktop — categories nothing has
 * been registered in yet, and that no agent scans, so there is no real data
 * to fall back to the way Laptop falls back to the audited fleet below.
 * Ten of each so the tab reads like a working list rather than a two-row
 * stub. `isDemo` is what keeps these from being mistaken for real
 * inventory — the table badges them and skips the assignment-history fetch,
 * since there is no real device behind the id to look up.
 */
export const DEMO_DEVICES: DeviceRecord[] = [
  { id: "demo-printer-1", category: "Printer", name: "HP LaserJet Pro M404n", serialNumber: "DEMO-PRN-88231", buyDate: "2025-03-10", currentUser: "Front Desk", isDemo: true },
  { id: "demo-printer-2", category: "Printer", name: "Canon imageCLASS MF445dw", serialNumber: "DEMO-PRN-40217", buyDate: "2024-09-22", currentUser: "", isDemo: true },
  { id: "demo-printer-3", category: "Printer", name: "Epson EcoTank ET-4850", serialNumber: "DEMO-PRN-19733", buyDate: "2025-06-01", currentUser: "Accounts Team", isDemo: true },
  { id: "demo-printer-4", category: "Printer", name: "Brother HL-L2395DW", serialNumber: "DEMO-PRN-60284", buyDate: "2023-11-15", currentUser: "", isDemo: true },
  { id: "demo-printer-5", category: "Printer", name: "Xerox WorkCentre 6515", serialNumber: "DEMO-PRN-77102", buyDate: "2024-02-28", currentUser: "Design Studio", isDemo: true },
  { id: "demo-printer-6", category: "Printer", name: "HP OfficeJet Pro 9015e", serialNumber: "DEMO-PRN-33456", buyDate: "2025-01-09", currentUser: "", isDemo: true },
  { id: "demo-printer-7", category: "Printer", name: "Canon PIXMA TR8620a", serialNumber: "DEMO-PRN-90871", buyDate: "2024-07-19", currentUser: "Reception", isDemo: true },
  { id: "demo-printer-8", category: "Printer", name: "Ricoh MP 2555", serialNumber: "DEMO-PRN-52390", buyDate: "2023-08-03", currentUser: "", isDemo: true },
  { id: "demo-printer-9", category: "Printer", name: "Lexmark MS431dw", serialNumber: "DEMO-PRN-14509", buyDate: "2025-04-22", currentUser: "HR Department", isDemo: true },
  { id: "demo-printer-10", category: "Printer", name: "Kyocera ECOSYS P2040dn", serialNumber: "DEMO-PRN-68820", buyDate: "2024-12-05", currentUser: "", isDemo: true },

  { id: "demo-projector-1", category: "Projector", name: "Epson PowerLite 2247U", serialNumber: "DEMO-PRJ-55210", buyDate: "2024-11-02", currentUser: "Conference Room A", isDemo: true },
  { id: "demo-projector-2", category: "Projector", name: "BenQ MW632ST", serialNumber: "DEMO-PRJ-30144", buyDate: "2025-02-14", currentUser: "", isDemo: true },
  { id: "demo-projector-3", category: "Projector", name: "Optoma HD146X", serialNumber: "DEMO-PRJ-77689", buyDate: "2024-05-30", currentUser: "Training Room", isDemo: true },
  { id: "demo-projector-4", category: "Projector", name: "ViewSonic PA503S", serialNumber: "DEMO-PRJ-91205", buyDate: "2023-10-11", currentUser: "", isDemo: true },
  { id: "demo-projector-5", category: "Projector", name: "Epson EB-2247U", serialNumber: "DEMO-PRJ-40312", buyDate: "2025-03-19", currentUser: "Boardroom", isDemo: true },
  { id: "demo-projector-6", category: "Projector", name: "BenQ TH685i", serialNumber: "DEMO-PRJ-66230", buyDate: "2024-08-07", currentUser: "", isDemo: true },
  { id: "demo-projector-7", category: "Projector", name: "Sony VPL-EX575", serialNumber: "DEMO-PRJ-18874", buyDate: "2023-12-22", currentUser: "Auditorium", isDemo: true },
  { id: "demo-projector-8", category: "Projector", name: "Optoma EH412", serialNumber: "DEMO-PRJ-52091", buyDate: "2025-05-16", currentUser: "", isDemo: true },
  { id: "demo-projector-9", category: "Projector", name: "Panasonic PT-LB426", serialNumber: "DEMO-PRJ-84403", buyDate: "2024-01-27", currentUser: "Conference Room B", isDemo: true },
  { id: "demo-projector-10", category: "Projector", name: "NEC ME361X", serialNumber: "DEMO-PRJ-27950", buyDate: "2024-10-08", currentUser: "", isDemo: true },

  { id: "demo-desktop-1", category: "Desktop", name: "Dell OptiPlex 7010", serialNumber: "DEMO-DSK-19042", buyDate: "2025-01-18", currentUser: "", isDemo: true },
  { id: "demo-desktop-2", category: "Desktop", name: "Lenovo ThinkCentre M75q", serialNumber: "DEMO-DSK-73305", buyDate: "2023-12-04", currentUser: "Priya Sharma", isDemo: true },
  { id: "demo-desktop-3", category: "Desktop", name: "HP EliteDesk 800 G9", serialNumber: "DEMO-DSK-40218", buyDate: "2025-02-27", currentUser: "", isDemo: true },
  { id: "demo-desktop-4", category: "Desktop", name: "Dell Vostro 3888", serialNumber: "DEMO-DSK-66102", buyDate: "2024-06-13", currentUser: "Alex Rivera", isDemo: true },
  { id: "demo-desktop-5", category: "Desktop", name: "Lenovo IdeaCentre 5", serialNumber: "DEMO-DSK-90344", buyDate: "2023-09-29", currentUser: "", isDemo: true },
  { id: "demo-desktop-6", category: "Desktop", name: "HP Pavilion Desktop TP01", serialNumber: "DEMO-DSK-15590", buyDate: "2025-04-05", currentUser: "Jane Doe", isDemo: true },
  { id: "demo-desktop-7", category: "Desktop", name: "Acer Aspire TC-1660", serialNumber: "DEMO-DSK-52871", buyDate: "2024-03-21", currentUser: "", isDemo: true },
  { id: "demo-desktop-8", category: "Desktop", name: "Dell Inspiron 3020", serialNumber: "DEMO-DSK-77630", buyDate: "2023-07-16", currentUser: "IT Storage", isDemo: true },
  { id: "demo-desktop-9", category: "Desktop", name: "ASUS ExpertCenter D700", serialNumber: "DEMO-DSK-28905", buyDate: "2025-06-09", currentUser: "", isDemo: true },
  { id: "demo-desktop-10", category: "Desktop", name: "Lenovo ThinkStation P360", serialNumber: "DEMO-DSK-63419", buyDate: "2024-11-30", currentUser: "Design Studio", isDemo: true },
];

/**
 * The audited fleet — the same devices Hardware Inventory lists — reshaped
 * into rows for the Laptop tab.
 *
 * Laptop is the one category this org's real machines already live in, just
 * under a different page: the agent reports these, so there is nothing to
 * fabricate the way `DEMO_DEVICES` fabricates a printer nobody owns. Buy
 * date is left blank — the audit has no concept of a purchase date — and it
 * renders as "—" the same as any other unrecorded date. `currentUser` reads
 * "" rather than the literal string "Unassigned" so the table's own "in the
 * store" styling applies, the same rule a manually registered unit follows.
 */
export const auditedLaptopRecords = (devices: HardwareDevice[]): DeviceRecord[] =>
  devices.map((device) => ({
    id: `audit:${device.id}`,
    category: "Laptop",
    name: device.name,
    serialNumber: device.serialNumber,
    buyDate: "",
    currentUser: device.assignedTo === "Unassigned" ? "" : device.assignedTo,
  }));

/**
 * True for a row read live off the audited fleet rather than stored in the
 * manual registry — see `auditedLaptopRecords`. There is no registered-devices
 * row behind an id like this, so editing one has to create it (adopting the
 * scanned machine into the registry) instead of updating something that
 * doesn't exist yet.
 */
export const isAuditedRecord = (device: DeviceRecord): boolean =>
  device.id.startsWith("audit:");

/**
 * True for a row nothing has registered yet — either read live off the
 * audited fleet or one of `DEMO_DEVICES`. Editing either kind has to create a
 * real row rather than update one that doesn't exist, so this is the one
 * check both the table and the edit form use to decide "Edit" from "Add to
 * registry".
 */
export const needsAdoption = (device: DeviceRecord): boolean =>
  Boolean(device.isDemo) || isAuditedRecord(device);

/**
 * Printer and Projector are shared-space equipment, not something checked out
 * to one person the way a Laptop or Desktop is — so there is no "current
 * holder" to show or hand off for them, and neither the table nor the add/
 * edit form asks for one.
 */
export const categoryTracksAssignment = (category: DeviceCategory): boolean =>
  category !== "Printer" && category !== "Projector";

/**
 * Rows of one tab, narrowed to the units that are out with someone or still in
 * store. An empty `currentUser` is the only marker of an unissued unit — the
 * server derives it from whether any assignment is still open, so the table
 * and the hand-off history can never disagree.
 *
 * Whichever category has nothing manually registered in it falls back to
 * something else, so a tab nobody has used yet never reads as broken: Laptop
 * falls back to the real audited fleet (`auditedLaptops`), everything else
 * falls back to `DEMO_DEVICES`. The moment a real unit is registered in a
 * category, this stops reaching for either fallback — real entries are never
 * mixed with fallback ones.
 */
export const devicesInCategory = (
  devices: DeviceRecord[],
  category: DeviceCategory,
  assignment: DeviceAssignmentFilter = "All",
  /** The audited fleet, already reshaped by `auditedLaptopRecords`. */
  auditedLaptops: DeviceRecord[] = [],
): DeviceRecord[] => {
  const real = devices.filter((device) => device.category === category);

  const source =
    real.length > 0
      ? real
      : category === "Laptop"
        ? auditedLaptops
        : DEMO_DEVICES.filter((device) => device.category === category);

  return source.filter((device) => {
    if (assignment === "Assigned") return Boolean(device.currentUser);
    if (assignment === "Unassigned") return !device.currentUser;
    return true;
  });
};
