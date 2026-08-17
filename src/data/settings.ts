/** Left-hand categories on the settings screen. */
export const SETTINGS_CATEGORIES = [
  "General",
  "User Management",
  "Asset Fields",
  "Security",
  "Agent Config",
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

/** A scan-depth option in the Agent Config category. */
export const SCAN_DEPTHS = [
  { id: "quick", title: "Quick Scan", description: "Collect major hardware specifications and top processes" },
  { id: "standard", title: "Standard Scan", description: "Detailed hardware, installed software registry, and network state" },
  { id: "deep", title: "Deep Scan", description: "Full directory indexing, detailed logs, and historic login sequences" },
];

/** Something the agent can be told to collect, or told to leave alone. */
export interface CollectionMetric {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const COLLECTION_METRICS: CollectionMetric[] = [
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

/* The User Management category reads the organization's real people from
   `data/admin` — see `ADMIN_USERS` — rather than keeping a second roster
   here that would drift away from the rest of the app. The Asset Fields
   category does the same with `data/assetFields`. */
