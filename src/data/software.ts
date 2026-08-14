import { TOTAL_DEVICES } from "./hardware";

/** Mock data — swap these exports for API responses later. */

/** Reported application count — the list only holds the current page of it. */
export const TOTAL_SOFTWARE_APPS = 1500;

/**
 * The software list walks the same machines the hardware inventory does, so
 * it reports the same estate size rather than a number of its own.
 */
export const TOTAL_SOFTWARE_DEVICES = TOTAL_DEVICES;

/** Every column the software list can show. */
export type SoftwareColumnKey =
  | "name"
  | "type"
  | "publisher"
  | "version"
  | "status"
  | "lastUsed"
  | "installPath"
  | "licenseType"
  | "installDate"
  | "assignedUser";

export const SOFTWARE_COLUMNS: {
  key: SoftwareColumnKey;
  label: string;
  visibleByDefault: boolean;
}[] = [
  { key: "name", label: "Application Name", visibleByDefault: true },
  { key: "type", label: "Type", visibleByDefault: true },
  { key: "publisher", label: "Publisher", visibleByDefault: true },
  { key: "version", label: "Version", visibleByDefault: true },
  { key: "status", label: "Status", visibleByDefault: true },
  { key: "lastUsed", label: "Last Used", visibleByDefault: true },
  { key: "installPath", label: "Install Path", visibleByDefault: false },
  { key: "licenseType", label: "License Type", visibleByDefault: false },
  { key: "installDate", label: "Install Date", visibleByDefault: false },
  { key: "assignedUser", label: "Assigned User", visibleByDefault: false },
];

export const DEFAULT_SOFTWARE_COLUMNS: SoftwareColumnKey[] =
  SOFTWARE_COLUMNS.filter((column) => column.visibleByDefault).map(
    (column) => column.key,
  );
