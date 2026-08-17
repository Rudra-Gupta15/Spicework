import { ADMIN_SITES, ADMIN_USERS } from "./admin";

/** Left-hand categories on the settings screen. */
export const SETTINGS_CATEGORIES = [
  "General",
  "User Management",
  "Owners",
  "Locations",
  "Notifications",
  "Security",
  "Agent Config",
  "Integrations",
  "Backup & Data",
  "Billing",
] as const;

export type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number];

/**
 * Portal preferences that belong to the organization but are not part of its
 * record — the name and industry come from `ORGANIZATION` itself, so they are
 * deliberately not duplicated here.
 */
export const GENERAL_SETTINGS = {
  companySize: "250 - 499 employees",
  timezone: "(GMT+05:30) India Standard Time",
  dateFormat: "DD MMM YYYY",
  language: "English (India)",
};

/** Brand accent shown in the branding panel. */
export const PRIMARY_THEME_COLOR = "#E8722A";

/** A titled on/off preference in the Notifications category. */
export interface NotificationPref {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const EMAIL_NOTIFICATIONS: NotificationPref[] = [
  { id: "email-1", title: "New device detected", description: "Receive immediate email when a new endpoint connects", enabled: true },
  { id: "email-2", title: "Software update available", description: "Get notified about pending critical updates", enabled: false },
  { id: "email-3", title: "Security alert", description: "Instant notifications on high severity policy violations", enabled: true },
  { id: "email-4", title: "Weekly summary report", description: "Scheduled report sent every Monday morning", enabled: true },
  { id: "email-5", title: "Ticket assigned to you", description: "When an asset ticket changes assignee", enabled: true },
];

export const PUSH_NOTIFICATIONS: NotificationPref[] = [
  { id: "push-1", title: "Critical device offline", description: "Push alert when core hardware goes offline", enabled: true },
  { id: "push-2", title: "Storage limit exceeded", description: "Immediate warning on low disk space events", enabled: true },
];

export const ALERT_THRESHOLDS = {
  cpu: 90,
  storage: 85,
  downtime: "15 minutes",
};

/** A device session in the Security category. */
export interface DeviceSession {
  id: string;
  device: string;
  ip: string;
  /** The session the admin is signed in from — cannot be revoked. */
  current: boolean;
}

export const SECURITY_DEFAULTS = {
  minLength: "12",
  requireUppercase: true,
  requireSpecial: true,
  passwordExpiry: "90 Days",
  enable2FA: true,
  backupCodes: "8F2K-9A1C-77QP",
  sessionTimeout: "30 Minutes",
};

export const ACTIVE_SESSIONS: DeviceSession[] = [
  { id: "sess-1", device: "MacBook Pro • macOS Sequoia", ip: "192.168.1.42", current: true },
  { id: "sess-2", device: "Google Chrome • Windows 11", ip: "102.16.8.99", current: false },
];

/** A third-party service in the Integrations category. */
export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

export const MASKED_API_KEY = "sp_api_live_••••••••••••3aef";

export const INTEGRATIONS: Integration[] = [
  { id: "slack", name: "Slack", description: "Deliver device log alerts and system alerts directly into operational channels", connected: true },
  { id: "teams", name: "Microsoft Teams", description: "Stream asset tickets updates and webhook payloads onto your teams feed", connected: false },
  { id: "jira", name: "Jira Software", description: "Sync assets automatically to Jira issues and support logs", connected: true },
  { id: "google", name: "Google Workspace", description: "Sync organizational users, departments, and credentials instantly", connected: false },
];

/** A scan-depth option in the Agent Config category. */
export const SCAN_DEPTHS = [
  { id: "quick", title: "Quick Scan", description: "Collect major hardware specifications and top processes" },
  { id: "standard", title: "Standard Scan", description: "Detailed hardware, installed software registry, and network state" },
  { id: "deep", title: "Deep Scan", description: "Full directory indexing, detailed logs, and historic login sequences" },
];

export const COLLECTION_METRICS: NotificationPref[] = [
  { id: "metric-hw", title: "Hardware Specs", description: "Include Motherboard, CPU, Storage, RAM specifications", enabled: true },
  { id: "metric-sw", title: "Installed Software", description: "Extract current software packages and update metadata", enabled: true },
  { id: "metric-net", title: "Network Info", description: "Interfaces, IP/MAC routing maps, active proxy configurations", enabled: true },
  { id: "metric-login", title: "User Login History", description: "Recent session tracking and console log statistics", enabled: false },
];

export const DEPLOYMENT_PACKAGES = [
  { id: "win", name: "Windows Agent Installer", detail: "MSI x64 package • 12MB", filename: "spiceworks-agent.msi" },
  { id: "mac", name: "macOS Daemon Package", detail: "PKG Universal • 9MB", filename: "spiceworks-agent.pkg" },
  { id: "linux", name: "Linux Collector Script", detail: "Bash installer script • 1MB", filename: "spiceworks-collector.sh" },
];

export const BACKUP_DEFAULTS = {
  exportFormat: "CSV",
  dateRange: "Last 30 Days",
  enableBackups: true,
  backupFrequency: "Daily",
  lastBackup: "2026-08-06 02:30 AM",
  nextScheduled: "2026-08-07 02:30 AM",
  retentionPeriod: "90 Days",
  autoDelete: true,
  cloudUsedPct: 24.8,
  cloudRemaining: "12.4 GB of 50 GB cloud storage remaining",
};

/** What the plan allows, against which the usage below is measured. */
const DEVICE_ALLOWANCE = 1000;
const USER_ALLOWANCE = 500;

export const SUBSCRIPTION = {
  plan: "Professional",
  rate: "$29",
  period: "month",
  inclusions: [
    `Up to ${DEVICE_ALLOWANCE.toLocaleString()} managed devices`,
    `Up to ${USER_ALLOWANCE} portal users`,
    "All available Analytics",
    "Priority business support",
  ],
};

/**
 * Counted from the same sites and users every other screen reads, so the
 * usage bars here can never disagree with the dashboard tiles. A function
 * rather than a constant: adding a site or inviting a user has to move
 * these bars, and a value captured at module load never would.
 */
export const resourceUsage = () => {
  const devices = ADMIN_SITES.reduce((sum, site) => sum + site.devices, 0);

  return [
    {
      id: "devices",
      label: "Managed Devices",
      display: `${devices.toLocaleString()} / ${DEVICE_ALLOWANCE.toLocaleString()}`,
      pct: Math.round((devices / DEVICE_ALLOWANCE) * 1000) / 10,
    },
    {
      id: "users",
      label: "Portal Users",
      display: `${ADMIN_USERS.length} / ${USER_ALLOWANCE}`,
      pct: Math.round((ADMIN_USERS.length / USER_ALLOWANCE) * 1000) / 10,
    },
    { id: "storage", label: "Cloud Storage", display: "12.4 / 50 GB", pct: 24.8 },
  ];
};

/** A past invoice in the Billing category. */
export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "Paid";
}

export const INVOICES: Invoice[] = [
  { id: "inv-1", date: "Aug 01, 2026", description: "Professional Plan - Monthly Renewal", amount: "$29.00", status: "Paid" },
  { id: "inv-2", date: "Jul 01, 2026", description: "Professional Plan - Monthly Renewal", amount: "$29.00", status: "Paid" },
  { id: "inv-3", date: "Jun 01, 2026", description: "Professional Plan - Monthly Renewal", amount: "$29.00", status: "Paid" },
  { id: "inv-4", date: "May 01, 2026", description: "Professional Plan - Signup", amount: "$29.00", status: "Paid" },
];

/* The User Management category reads the organization's real people from
   `data/admin` — see `ADMIN_USERS` — rather than keeping a second roster
   here that would drift away from the rest of the app. */
