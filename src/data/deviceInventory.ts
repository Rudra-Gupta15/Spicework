import { Laptop, Monitor, Printer, Projector } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type {
  DeviceAssignment,
  DeviceAssignmentFilter,
  DeviceCategory,
  DeviceDraft,
  DeviceRecord,
} from "@/types/device";

/* -------------------------------------------------------------------------
 * The registered-device estate behind /inventory/device.
 * One tab per category; each tab is the same table over its own rows.
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

/** Compact source form — `[name, serial, buy date, current user]`. */
type Row = [name: string, serial: string, buyDate: string, user: string];

const ROWS: Record<DeviceCategory, Row[]> = {
  Laptop: [
    ["Dell Latitude 5420", "SN-DL5420-3891", "2024-01-15", "Jane Doe"],
    ["MacBook Pro M3", "SN-MBP-M3-7742", "2023-03-22", "John Smith"],
    ["ASUS ROG Zephyrus G14", "SN-G14-2024-0847", "2024-08-10", "Alice Johnson"],
    ["HP EliteBook 840", "SN-HP-840-2211", "2023-11-02", ""],
    ["Lenovo ThinkPad X1 Carbon", "SN-LT-X1C-9902", "2024-02-18", "Bob Wilson"],
    ["Acer Aspire A715", "SN-AC-A715-4410", "2023-09-05", "Sarah Chen"],
    ["Dell XPS 15", "SN-DL-XPS15-6120", "2024-05-27", "Michael Brown"],
    ["MacBook Air M2", "SN-MBA-M2-3308", "2023-06-14", "Priya Nair"],
    ["HP ProBook 450 G9", "SN-HP-450-7781", "2024-03-30", ""],
    ["Lenovo IdeaPad Slim 5", "SN-LT-IP5-5540", "2023-12-08", "Daniel Perez"],
    ["Dell Vostro 3520", "SN-DL-V3520-1187", "2024-07-19", "Emily Clark"],
    ["MSI Modern 14", "SN-MSI-M14-9034", "2023-04-11", "Rahul Mehta"],
    ["Apple MacBook Pro 16", "SN-MBP-16-2276", "2024-10-01", "Laura Bennett"],
    ["HP Pavilion 15", "SN-HP-P15-8823", "2023-08-23", ""],
  ],
  Printer: [
    ["HP LaserJet Pro M404dn", "SN-HP-M404-3312", "2023-02-09", "Front Desk"],
    ["Canon imageCLASS MF445dw", "SN-CN-MF445-7756", "2024-04-16", "Accounts"],
    ["Epson EcoTank L3250", "SN-EP-L3250-2204", "2023-10-25", "HR"],
    ["Brother HL-L2350DW", "SN-BR-L2350-6690", "2024-01-08", ""],
    ["Xerox VersaLink C405", "SN-XR-C405-4471", "2022-12-13", "Design Studio"],
    ["HP OfficeJet Pro 9020", "SN-HP-9020-1158", "2024-06-03", "Sales Floor"],
    ["Canon PIXMA G3020", "SN-CN-G3020-8827", "2023-07-21", "Reception"],
    ["Epson WorkForce WF-7840", "SN-EP-7840-5563", "2024-09-12", ""],
  ],
  Projector: [
    ["Epson EB-X51", "SN-EP-X51-4402", "2023-05-18", "Meeting Room A"],
    ["BenQ MW550", "SN-BQ-MW550-9917", "2024-02-27", "Training Room"],
    ["ViewSonic PA503X", "SN-VS-PA503-3345", "2022-11-30", "Board Room"],
    ["Sony VPL-EX435", "SN-SY-EX435-7728", "2024-08-05", ""],
    ["Optoma HD146X", "SN-OP-HD146-1194", "2023-09-14", "Meeting Room B"],
    ["Epson EB-FH52", "SN-EP-FH52-6673", "2024-11-22", "Auditorium"],
  ],
  Desktop: [
    ["Dell OptiPlex 7010", "SN-DL-7010-2261", "2023-01-26", "Kevin Adams"],
    ["HP EliteDesk 800 G6", "SN-HP-800-5518", "2024-03-07", "Nisha Rao"],
    ["Lenovo ThinkCentre M70q", "SN-LT-M70Q-8842", "2023-08-19", "Tom Hayes"],
    ["Apple iMac 24", "SN-AP-IMAC24-3379", "2024-05-11", "Grace Liu"],
    ["Dell Precision 3660", "SN-DL-P3660-7705", "2024-09-29", ""],
    ["HP ProDesk 400 G7", "SN-HP-400-1136", "2022-10-04", "Arjun Patel"],
    ["Acer Veriton X2690G", "SN-AC-X2690-9960", "2023-12-16", "Megan Foster"],
    ["Lenovo ThinkCentre M90t", "SN-LT-M90T-4428", "2024-07-02", "Chris Miller"],
    ["Dell Inspiron 3910", "SN-DL-3910-6084", "2023-04-23", "Sofia Rossi"],
    ["HP Z2 Mini G9", "SN-HP-Z2-2213", "2024-12-09", ""],
  ],
};

/** `SN-DL5420-3891` → `sn-dl5420-3891`; the serial is already unique. */
const idFor = (serial: string): string => serial.toLowerCase();

export const DEVICE_SEED: DeviceRecord[] = DEVICE_CATEGORIES.flatMap(
  ({ id: category }) =>
    ROWS[category].map(([name, serialNumber, buyDate, currentUser]) => ({
      id: idFor(serialNumber),
      category,
      name,
      serialNumber,
      buyDate,
      currentUser,
    })),
);

/**
 * Hand-off history, keyed by device id. Only devices that have actually
 * changed hands are listed — everything else falls back to the single open
 * assignment derived in `assignmentHistory` below.
 */
const HISTORY: Record<string, DeviceAssignment[]> = {
  "sn-dl5420-3891": [
    {
      id: "sn-dl5420-3891-2",
      user: "Jane Doe",
      assignedOn: "2025-02-03",
      note: "Reassigned after team move",
    },
    {
      id: "sn-dl5420-3891-1",
      user: "Mark Turner",
      assignedOn: "2024-01-20",
      returnedOn: "2025-01-28",
      note: "Returned on exit",
    },
  ],
  "sn-mbp-m3-7742": [
    {
      id: "sn-mbp-m3-7742-2",
      user: "John Smith",
      assignedOn: "2024-06-11",
      note: "Swapped from a 2019 model",
    },
    {
      id: "sn-mbp-m3-7742-1",
      user: "Olivia Reed",
      assignedOn: "2023-03-27",
      returnedOn: "2024-06-05",
      note: "Moved to the Bangalore office",
    },
  ],
  "sn-hp-840-2211": [
    {
      id: "sn-hp-840-2211-1",
      user: "Ethan Walker",
      assignedOn: "2023-11-08",
      returnedOn: "2025-06-30",
      note: "Returned to store — awaiting reissue",
    },
  ],
  "sn-lt-x1c-9902": [
    {
      id: "sn-lt-x1c-9902-1",
      user: "Bob Wilson",
      assignedOn: "2024-02-22",
      note: "First issue",
    },
  ],
  "sn-xr-c405-4471": [
    {
      id: "sn-xr-c405-4471-2",
      user: "Design Studio",
      assignedOn: "2024-01-15",
      note: "Moved up from the 2nd floor",
    },
    {
      id: "sn-xr-c405-4471-1",
      user: "Marketing",
      assignedOn: "2022-12-20",
      returnedOn: "2024-01-10",
    },
  ],
};

/**
 * Newest first. A device with no recorded hand-offs still has a history:
 * either it has been with its current holder since it was bought, or it has
 * never been issued at all.
 */
export const assignmentHistory = (device: DeviceRecord): DeviceAssignment[] => {
  const recorded = HISTORY[device.id];
  if (recorded) return recorded;

  if (!device.currentUser) return [];

  return [
    {
      id: `${device.id}-1`,
      user: device.currentUser,
      assignedOn: device.buyDate,
      note: "Issued when the device was registered",
    },
  ];
};

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
 * Rows of one tab, in the order they were registered, narrowed to the units
 * that are out with someone or still in store. An empty `currentUser` is the
 * only marker of an unissued unit — the same one the table reads.
 */
export const devicesInCategory = (
  devices: DeviceRecord[],
  category: DeviceCategory,
  assignment: DeviceAssignmentFilter = "All",
): DeviceRecord[] =>
  devices.filter((device) => {
    if (device.category !== category) return false;
    if (assignment === "Assigned") return Boolean(device.currentUser);
    if (assignment === "Unassigned") return !device.currentUser;
    return true;
  });

/**
 * A device added from the dialog. The serial is the identity, so a repeat
 * of one already on the list is rejected by the dialog before it gets here.
 */
export const createDevice = (draft: DeviceDraft): DeviceRecord => ({
  ...draft,
  id: idFor(draft.serialNumber),
});
