import type {
  CloudDetailRow,
  CloudService,
  CloudServiceDetail,
  CloudUsageRow,
} from "@/types/cloud";

/** Mock data — swap these exports for API responses later. */

const SUBSCRIPTION_LABELS = [
  "Active Service Tier",
  "Billing Cycle",
  "Contract Period Start",
  "Contract Termination Date",
  "Automatic Plan Renewal",
] as const;

const TENANT_LABELS = [
  "Target Host URL",
  "Primary Account Admin",
  "Provider Technical Support",
  "Compliance Tag Status",
  "Connected Workspace Integration",
] as const;

/** Values line up with the label lists above, in order. */
type FiveValues = [string, string, string, string, string];

/** `[department, active users, compute scale, consumption, cost share]`. */
type UsageRow = [string, string, string, string, string];

interface DetailSource {
  subscription: FiveValues;
  tenant: FiveValues;
  usage: UsageRow[];
}

const DETAILS: Record<string, DetailSource> = {
  "aws-production": {
    subscription: [
      "Enterprise Support Plan",
      "Monthly Metered Invoice",
      "Apr 1, 2025",
      "Mar 31, 2027",
      "Yes - Enabled",
    ],
    tenant: [
      "console.aws.amazon.com",
      "admin-aws@spiceworks-corp.com",
      "Business Support Plan (24x7)",
      "All Audits Successful",
      "AWS IAM Identity Center",
    ],
    usage: [
      ["Engineering Platform", "186 users", "62 EC2 Instances", "4.8 TB / Month", "$9,400"],
      ["Data Science & BI", "74 users", "12 EMR Clusters", "2.1 TB / Month", "$4,250"],
      ["Customer Operations Support", "96 users", "8 RDS Databases", "900 GB / Month", "$3,100"],
      ["HR & Legal Compliance", "56 users", "S3 Archive Storage", "350 GB / Month", "$1,450"],
    ],
  },

  "azure-core": {
    subscription: [
      "Enterprise Tier E5 Plan",
      "Annually Recurred Invoice",
      "Jan 1, 2025",
      "Dec 31, 2026",
      "Yes - Enabled",
    ],
    tenant: [
      "portal.azure.com",
      "admin-azure@spiceworks-corp.com",
      "Premier Enterprise Plan (A+)",
      "All Audits Successful",
      "SAML Active Directory",
    ],
    usage: [
      ["Engineering Platform", "84 users", "40 VMs (D-Series)", "1.2 TB / Month", "$4,120"],
      ["Data Science & BI", "32 users", "6 HDInsight Nodes", "850 GB / Month", "$2,300"],
      ["Customer Operations Support", "25 users", "Virtual Desktops", "200 GB / Month", "$1,280"],
      ["HR & Legal Compliance", "15 users", "Azure Active Directory", "40 GB / Month", "$750"],
    ],
  },

  "salesforce-crm": {
    subscription: [
      "Sales Cloud Unlimited",
      "Annually Recurred Invoice",
      "Mar 11, 2025",
      "Mar 10, 2027",
      "Yes - Enabled",
    ],
    tenant: [
      "spiceworks.my.salesforce.com",
      "admin-crm@spiceworks-corp.com",
      "Premier Success Plan",
      "All Audits Successful",
      "SAML Single Sign-On",
    ],
    usage: [
      ["Sales Operations", "148 users", "Sales Cloud Licenses", "120 GB / Month", "$2,240"],
      ["Customer Operations Support", "92 users", "Service Cloud Console", "80 GB / Month", "$1,480"],
      ["Marketing & Growth", "64 users", "Marketing Cloud Add-on", "60 GB / Month", "$980"],
      ["HR & Legal Compliance", "36 users", "Reporting & Audit Access", "25 GB / Month", "$500"],
    ],
  },

  "google-cloud-sandbox": {
    subscription: [
      "Sandbox Developer Tier",
      "Monthly Metered Invoice",
      "Feb 06, 2025",
      "Feb 05, 2027",
      "No - Suspended",
    ],
    tenant: [
      "console.cloud.google.com",
      "admin-gcp@spiceworks-corp.com",
      "Standard Support Plan",
      "Review Pending",
      "Google Workspace SSO",
    ],
    usage: [
      ["Engineering Platform", "8 users", "4 GKE Nodes", "180 GB / Month", "$760"],
      ["Data Science & BI", "3 users", "BigQuery Sandbox", "60 GB / Month", "$320"],
      ["QA & Release", "1 user", "2 Preemptible VMs", "20 GB / Month", "$120"],
    ],
  },

  "slack-collaboration": {
    subscription: [
      "Enterprise Grid Plan",
      "Annually Recurred Invoice",
      "Jul 1, 2025",
      "Jun 30, 2026",
      "Yes - Enabled",
    ],
    tenant: [
      "spiceworks.slack.com",
      "admin-slack@spiceworks-corp.com",
      "Enterprise Support (24x7)",
      "All Audits Successful",
      "SCIM User Provisioning",
    ],
    usage: [
      ["Engineering Platform", "212 users", "Unlimited Workspaces", "640 GB / Month", "$1,580"],
      ["Customer Operations Support", "164 users", "Shared Channels", "380 GB / Month", "$1,120"],
      ["Sales Operations", "96 users", "Connect Guest Access", "210 GB / Month", "$700"],
      ["HR & Legal Compliance", "40 users", "eDiscovery & Retention", "90 GB / Month", "$400"],
    ],
  },

  "legacy-web-hosting": {
    subscription: [
      "Shared Hosting Legacy",
      "Annually Recurred Invoice",
      "Aug 1, 2023",
      "Jul 31, 2026",
      "No - Disabled",
    ],
    tenant: [
      "legacy.hostgator.com",
      "admin-web@spiceworks-corp.com",
      "Basic Email Support",
      "Action Required",
      "Local Accounts Only",
    ],
    usage: [
      ["Marketing & Growth", "0 users", "2 Shared Sites", "15 GB / Month", "$300"],
      ["HR & Legal Compliance", "0 users", "Archived Mailboxes", "5 GB / Month", "$150"],
    ],
  },
};

const toRows = (
  labels: readonly string[],
  values: FiveValues,
): CloudDetailRow[] =>
  labels.map((label, index) => ({ key: label, label, value: values[index] }));

const toUsage = (rows: UsageRow[]): CloudUsageRow[] =>
  rows.map(([department, activeUsers, scale, consumption, costShare]) => ({
    id: department,
    department,
    activeUsers,
    scale,
    consumption,
    costShare,
  }));

/** Detail panels for a service, or `null` when the scan reported none. */
export const getServiceDetail = (
  service: CloudService,
): CloudServiceDetail | null => {
  const source = DETAILS[service.id];
  if (!source) return null;

  return {
    subscription: toRows(SUBSCRIPTION_LABELS, source.subscription),
    tenant: toRows(TENANT_LABELS, source.tenant),
    usage: toUsage(source.usage),
  };
};

export const CLOUD_DETAIL_SUBTITLE =
  "Detailed breakdown of operational spend, compute scale, and resource ownership.";
