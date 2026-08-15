import type {
  CloudDetailRow,
  CloudService,
  CloudServiceDetail,
  CloudServiceFormValues,
} from "@/types/cloud";

import { CLOUD_SERVICES } from "./cloudAssets";

/** Mock data — swap these exports for API responses later. */

/** Providers already in the inventory, plus an escape hatch for new vendors. */
export const PROVIDER_OPTIONS = [
  ...new Set(CLOUD_SERVICES.map((service) => service.provider)),
  "Other / Custom Provider",
];

/** Long form of the `SaaS` / `IaaS` / `PaaS` codes stored on a service. */
const CATEGORY_BY_CODE: Record<string, string> = {
  SaaS: "SaaS - Software as a Service",
  IaaS: "IaaS - Infrastructure as a Service",
  PaaS: "PaaS - Platform as a Service",
};

export const CATEGORY_OPTIONS = Object.values(CATEGORY_BY_CODE);

export const BILLING_INTERVAL_OPTIONS = [
  "Monthly Recurring Invoice",
  "Monthly Metered Invoice",
  "Quarterly Invoice",
  "Annually Recurred Invoice",
];

export const DEPARTMENT_OPTIONS = [
  "Engineering Platform",
  "Data Science & BI",
  "Customer Operations Support",
  "Sales Operations",
  "Marketing & Growth",
  "HR & Legal Compliance",
  "QA & Release",
];

/**
 * Keeps a stored value selectable even when it is not in the option list —
 * mock records can hold values the catalog has not caught up with yet.
 */
export const withValue = (options: string[], value: string): string[] =>
  value && !options.includes(value) ? [value, ...options] : options;

const rowValue = (rows: CloudDetailRow[], label: string): string =>
  rows.find((row) => row.label === label)?.value ?? "";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** `"Apr 1, 2025"` -> `"2025-04-01"`; anything else comes back empty. */
const toISODate = (value: string): string => {
  const match = /^([A-Za-z]{3})\w*\s+(\d{1,2}),\s*(\d{4})$/.exec(value.trim());
  if (!match) return "";

  const month = MONTHS.indexOf(match[1]);
  if (month < 0) return "";

  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[2].padStart(2, "0")}`;
};

/** The detail screen stores bare hosts; the form asks for a full URL. */
const toUrl = (host: string): string =>
  !host || host.startsWith("http") ? host : `https://${host}`;

/** Prefills the edit form from the record the detail screen renders. */
export const toFormValues = (
  service: CloudService,
  detail: CloudServiceDetail,
): CloudServiceFormValues => ({
  name: service.name,
  provider: service.provider,
  category: CATEGORY_BY_CODE[service.category] ?? service.category,
  endpoint: toUrl(rowValue(detail.tenant, "Target Host URL")),
  planTier: rowValue(detail.subscription, "Active Service Tier"),
  monthlySpend: service.monthlyCost,
  billingInterval: rowValue(detail.subscription, "Billing Cycle"),
  startDate: toISODate(rowValue(detail.subscription, "Contract Period Start")),
  expiryDate: toISODate(
    rowValue(detail.subscription, "Contract Termination Date"),
  ),
  autoRenew: rowValue(detail.subscription, "Automatic Plan Renewal").startsWith(
    "Yes",
  ),
  adminContact: rowValue(detail.tenant, "Primary Account Admin"),
  /* The biggest consumer is the group the contract is booked against. */
  department: detail.usage[0]?.department ?? "",
  maxLicenses: service.users ? String(service.users) : "",
  notes: "",
});
