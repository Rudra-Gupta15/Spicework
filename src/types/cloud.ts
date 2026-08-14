/** Where a cloud service sits in its lifecycle. */
export type CloudStatus = "Active" | "Suspended" | "Inactive";

/** One subscription / platform in the cloud inventory. */
export interface CloudService {
  id: string;
  name: string;
  provider: string;
  /** SaaS, IaaS or PaaS. */
  category: string;
  status: CloudStatus;
  /** Seats reported by the provider. */
  users: number;
  /** Recurring cost, already formatted for display. */
  monthlyCost: string;
  /** Next renewal, or "Expired" once it has lapsed. */
  renewalDate: string;
}

/** One label/value line in a detail card. */
export interface CloudDetailRow {
  key: string;
  label: string;
  value: string;
}

/** One department's slice of a service, on the detail screen. */
export interface CloudUsageRow {
  id: string;
  department: string;
  activeUsers: string;
  scale: string;
  consumption: string;
  costShare: string;
}

/** Everything the cloud asset detail screen renders. */
export interface CloudServiceDetail {
  /** Contract and billing terms. */
  subscription: CloudDetailRow[];
  /** Tenant, ownership and compliance. */
  tenant: CloudDetailRow[];
  usage: CloudUsageRow[];
}

/** Every field of the cloud service entry / edit form. */
export interface CloudServiceFormValues {
  name: string;
  provider: string;
  category: string;
  endpoint: string;
  planTier: string;
  monthlySpend: string;
  billingInterval: string;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  adminContact: string;
  department: string;
  maxLicenses: string;
  notes: string;
}

/** Validation messages, keyed by the field they belong to. */
export type CloudServiceFormErrors = Partial<
  Record<keyof CloudServiceFormValues, string>
>;

/** Active values of the cloud filter bar. */
export interface CloudFilterState {
  search: string;
  category: string;
  status: string;
  provider: string;
}
