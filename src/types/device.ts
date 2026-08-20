/** The four kinds of asset the Device screen keeps one tab for. */
export type DeviceCategory = "Laptop" | "Printer" | "Projector" | "Desktop";

/** A single registered unit — one row of the inventory table. */
export interface DeviceRecord {
  id: string;
  category: DeviceCategory;
  name: string;
  serialNumber: string;
  /** ISO `YYYY-MM-DD`; the table formats it for display. */
  buyDate: string;
  /** Empty while the unit sits in the store — shown as "Unassigned". */
  currentUser: string;
}

/** Narrows a tab to the units that are out with someone, or still in store. */
export type DeviceAssignmentFilter = "All" | "Assigned" | "Unassigned";

/** One spell of ownership. The open one is the row's current user. */
export interface DeviceAssignment {
  id: string;
  user: string;
  /** ISO `YYYY-MM-DD`. */
  assignedOn: string;
  /** Absent while the user still holds the device. */
  returnedOn?: string;
  /** Why it moved — "New joiner", "Replaced faulty battery"… */
  note?: string;
}

/** What the Add dialog collects, before an id is assigned. */
export type DeviceDraft = Omit<DeviceRecord, "id">;
