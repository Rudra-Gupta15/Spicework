import { Building2, FileCheck, RefreshCcw, Sigma } from "lucide-react";

import type { StatMetric } from "@/types/ui";

/** Mock data — swap these exports for API responses later. */

/** Reported application count — the list only holds the current page of it. */
export const TOTAL_SOFTWARE_APPS = 1500;

export const SOFTWARE_STATS: StatMetric[] = [
  {
    id: "total-software",
    label: "Total Software",
    value: TOTAL_SOFTWARE_APPS.toString(),
    icon: Sigma,
    tone: "brand",
    to: "/inventory/software/assets",
  },
  {
    id: "total-license",
    label: "Total License",
    value: "723",
    icon: FileCheck,
    tone: "brand",
  },
  {
    id: "subscription-count",
    label: "Subscription Count",
    value: "215",
    icon: RefreshCcw,
    tone: "brand",
  },
  {
    id: "publisher-count",
    label: "Publisher Count",
    value: "562",
    icon: Building2,
    tone: "brand",
  },
];

/** Reported estate size — the table only holds the current page of it. */
export const TOTAL_SOFTWARE_DEVICES = 847;

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
