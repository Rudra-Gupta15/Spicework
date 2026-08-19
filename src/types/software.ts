import type { DateRange } from "@/lib/dateRange";

/** One device that has a given application+version installed. */
export interface SoftwareInstall {
  id: string;
  name: string;
}

/** One distinct (application, version) combo, aggregated across every device that has it installed. */
export interface SoftwareInventoryItem {
  id: string;
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  size: string;
  /** Number of devices with this exact name+version installed. */
  installCount: number;
  /** Every device that has it, each linkable to that device's Software detail page. */
  devices: SoftwareInstall[];
  /** Comma-joined device names — used for search. */
  installedOn: string;
}

/** Every column the software inventory table can show. */
export type SoftwareColumnKey = Exclude<keyof SoftwareInventoryItem, "id" | "devices">;

/** How widely an application is deployed — the one dimension worth bucketing
    at this table's grain, since exact install counts vary too much to filter on directly. */
export type SoftwareInstallScope = "All" | "Single Device" | "Multiple Devices";

/** Active values of the software filter bar. */
export interface SoftwareFilterState {
  search: string;
  publisher: string;
  installScope: SoftwareInstallScope;
  /** When the application was installed — "Unknown" drops out once set. */
  installed: DateRange;
}
