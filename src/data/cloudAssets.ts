import { Cloud, CloudOff, RefreshCcw, Wallet } from "lucide-react";

import type { StatMetric } from "@/types/ui";
import type { CloudFilterState, CloudService } from "@/types/cloud";

/** Mock data — swap these exports for API responses later. */

/** Reported service count — the table only holds the current page of it. */
export const TOTAL_CLOUD_SERVICES = 87;

export const CLOUD_STATS: StatMetric[] = [
  {
    id: "total",
    label: "Total Cloud Services",
    value: TOTAL_CLOUD_SERVICES.toString(),
    icon: Cloud,
    tone: "brand",
  },
  {
    id: "active",
    label: "Active Subscriptions",
    value: "72",
    icon: RefreshCcw,
    tone: "brand",
  },
  {
    id: "inactive",
    label: "Inactive / Suspended",
    value: "15",
    icon: CloudOff,
    tone: "brand",
  },
  {
    id: "spend",
    label: "Monthly Spend",
    value: "42,850",
    icon: Wallet,
    tone: "brand",
  },
];

export const CLOUD_SERVICES: CloudService[] = [
  {
    id: "aws-production",
    name: "AWS Production Cloud",
    provider: "Amazon Web Services",
    category: "IaaS",
    status: "Active",
    users: 412,
    monthlyCost: "$18,200",
    renewalDate: "Jan 15, 2027",
  },
  {
    id: "azure-core",
    name: "Microsoft Azure Core",
    provider: "Microsoft Corp.",
    category: "IaaS",
    status: "Active",
    users: 156,
    monthlyCost: "$8,450",
    renewalDate: "Dec 31, 2026",
  },
  {
    id: "salesforce-crm",
    name: "Salesforce CRM",
    provider: "Salesforce Inc.",
    category: "SaaS",
    status: "Active",
    users: 340,
    monthlyCost: "$5,200",
    renewalDate: "Mar 10, 2027",
  },
  {
    id: "google-cloud-sandbox",
    name: "Google Cloud Sandbox",
    provider: "Google LLC",
    category: "PaaS",
    status: "Suspended",
    users: 12,
    monthlyCost: "$1,200",
    renewalDate: "Feb 05, 2027",
  },
  {
    id: "slack-collaboration",
    name: "Slack Collaboration Suite",
    provider: "Slack Technologies",
    category: "SaaS",
    status: "Active",
    users: 512,
    monthlyCost: "$3,800",
    renewalDate: "Jun 30, 2026",
  },
  {
    id: "legacy-web-hosting",
    name: "Legacy Web Hosting",
    provider: "HostGator",
    category: "PaaS",
    status: "Inactive",
    users: 0,
    monthlyCost: "$450",
    renewalDate: "Expired",
  },
];

/* Each filter keeps its own "everything" label, the way the design reads. */
const ALL_CATEGORIES = "SaaS/IaaS/PaaS";
const ALL_STATUSES = "All Active";
const ALL_PROVIDERS = "All Providers";

/** Filter options derived from the data so they never fall out of sync. */
const uniqueValues = (
  all: string,
  pick: (service: CloudService) => string,
): string[] => [all, ...new Set(CLOUD_SERVICES.map(pick))];

export const CLOUD_FILTER_OPTIONS = {
  category: uniqueValues(ALL_CATEGORIES, (service) => service.category),
  status: uniqueValues(ALL_STATUSES, (service) => service.status),
  provider: uniqueValues(ALL_PROVIDERS, (service) => service.provider),
};

export const DEFAULT_CLOUD_FILTERS: CloudFilterState = {
  search: "",
  category: ALL_CATEGORIES,
  status: ALL_STATUSES,
  provider: ALL_PROVIDERS,
};

/** True when a filter would narrow the result set. */
export const isFiltered = (filters: CloudFilterState): boolean =>
  filters.search.trim() !== "" ||
  filters.category !== ALL_CATEGORIES ||
  filters.status !== ALL_STATUSES ||
  filters.provider !== ALL_PROVIDERS;

/** Applies the filter bar to the service list. */
export const filterServices = (
  services: CloudService[],
  { search, category, status, provider }: CloudFilterState,
): CloudService[] => {
  const term = search.trim().toLowerCase();

  return services.filter(
    (service) =>
      (category === ALL_CATEGORIES || service.category === category) &&
      (status === ALL_STATUSES || service.status === status) &&
      (provider === ALL_PROVIDERS || service.provider === provider) &&
      (term === "" ||
        `${service.name} ${service.provider} ${service.category}`
          .toLowerCase()
          .includes(term)),
  );
};
