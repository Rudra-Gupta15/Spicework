import type { LogEntry } from "@/types/log";

/** Mock data — swap these exports for API responses later. */

export const DEVICE_LOG_TABS = [
  "Overview",
  "Hardware",
  "Software",
  "Network",
  "Tickets",
  "History",
] as const;

export type DeviceLogTab = (typeof DEVICE_LOG_TABS)[number];

export const DEVICE_INFO = {
  name: "Dell Latitude 5520",
  assetTag: "HW-00412",
  status: "Active",
  statusDetail: "Connected",
  assignee: "Alex Rivera",
  assigneeTeam: "Marketing Team",
};

/** Label / value lines in the specifications panel. */
export const DEVICE_SPECS: { label: string; value: string }[] = [
  { label: "OS", value: "macOS 14.4.2 (Sonoma)" },
  { label: "Last Seen", value: "2 minutes ago" },
  { label: "IP Address", value: "192.168.1.105" },
  { label: "Location", value: "Floor 3 - Desk 42" },
  { label: "Warranty", value: "Valid until Dec 2026" },
  { label: "Purchased", value: "Jan 15, 2024" },
];

/** Health meters — `tone` picks the bar colour. */
export const DEVICE_HEALTH: {
  label: string;
  detail: string;
  value: number;
  tone: "good" | "warning";
}[] = [
  { label: "CPU Usage", detail: "Normal (12%)", value: 12, tone: "good" },
  { label: "Memory Usage", detail: "72% of 16GB", value: 72, tone: "warning" },
  { label: "Disk Usage", detail: "45% of 512GB", value: 45, tone: "good" },
  { label: "Battery Health", detail: "Good (94%)", value: 94, tone: "good" },
];

/** Label / value lines in the Hardware tab's spec sheet. */
export const DEVICE_HARDWARE: { label: string; value: string }[] = [
  { label: "Manufacturer", value: "Dell Inc." },
  { label: "Model", value: "Latitude 5520" },
  { label: "Serial Number", value: "SN-8834521" },
  { label: "Processor (CPU)", value: "Intel Core i7-1185G7 @ 3.00GHz" },
  { label: "Memory (RAM)", value: "16GB DDR4 (Dual Channel)" },
  { label: "Storage Capacity", value: "512GB NVMe SSD (PCIe Gen3 x4)" },
  { label: "Display Specs", value: '15.6" FHD (1920x1080) IPS Anti-glare' },
  { label: "Graphics (GPU)", value: "Intel Iris Xe Graphics" },
  { label: "Battery Unit", value: "4-cell 63Wh Lithium-Ion" },
  { label: "WiFi/Wireless", value: "Intel Wi-Fi 6 AX201 + Bluetooth 5.2" },
];

/** Devices currently attached, in the Hardware tab. */
export const DEVICE_PERIPHERALS: {
  id: string;
  name: string;
  type: string;
  interface: string;
}[] = [
  {
    id: "per-1",
    name: "Dell UltraSharp U2722D",
    type: "Display Monitor",
    interface: "USB-C DisplayPort Alt Mode",
  },
  {
    id: "per-2",
    name: "Logitech MX Keys Wireless",
    type: "Keyboard Input",
    interface: "Logitech Bolt Receiver",
  },
  {
    id: "per-3",
    name: "Logitech MX Master 3S",
    type: "Pointer Mouse",
    interface: "Bluetooth Low Energy",
  },
];

/** One installed package in the Software tab. */
export interface InstalledPackage {
  id: string;
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  size: string;
  status: "Up to date" | "Updated" | "Update available";
}

/** Reported package count — the table holds the current page of it. */
export const TOTAL_SOFTWARE = 23;

export const DEVICE_SOFTWARE: InstalledPackage[] = [
  { id: "sw-1", name: "Microsoft 365 Enterprise", version: "16.78.2", publisher: "Microsoft Corp.", installDate: "2026-03-12", size: "2.4 GB", status: "Up to date" },
  { id: "sw-2", name: "Adobe Creative Cloud", version: "12.5.6", publisher: "Adobe Inc.", installDate: "2026-04-22", size: "3.8 GB", status: "Updated" },
  { id: "sw-3", name: "Figma Desktop Client", version: "124.1.0", publisher: "Figma Inc.", installDate: "2026-04-15", size: "412 MB", status: "Up to date" },
  { id: "sw-4", name: "Slack Collaboration App", version: "4.36.140", publisher: "Slack Technologies", installDate: "2026-01-20", size: "180 MB", status: "Up to date" },
  { id: "sw-5", name: "Zoom Meetings Client", version: "5.17.5", publisher: "Zoom Video Comm.", installDate: "2025-11-05", size: "240 MB", status: "Update available" },
  { id: "sw-6", name: "Google Chrome Browser", version: "124.0.6367", publisher: "Google LLC", installDate: "2026-04-20", size: "320 MB", status: "Up to date" },
  { id: "sw-7", name: "Visual Studio Code", version: "1.89.0", publisher: "Microsoft Corp.", installDate: "2026-04-24", size: "540 MB", status: "Up to date" },
  { id: "sw-8", name: "Docker Desktop", version: "4.29.0", publisher: "Docker Inc.", installDate: "2026-02-18", size: "1.2 GB", status: "Update available" },
  { id: "sw-9", name: "Postman", version: "10.24.0", publisher: "Postman Inc.", installDate: "2026-03-30", size: "290 MB", status: "Up to date" },
  { id: "sw-10", name: "1Password", version: "8.10.28", publisher: "AgileBits Inc.", installDate: "2026-04-02", size: "160 MB", status: "Updated" },
];

/** Current-connection rows in the Network tab; `accent` greens the value. */
export const DEVICE_CONNECTION: {
  label: string;
  value: string;
  accent?: boolean;
}[] = [
  { label: "Interface Adapter", value: "Wi-Fi (Intel AX201)" },
  { label: "SSID Network", value: "SpiceWorks-5G" },
  { label: "Signal Strength", value: "Excellent (100%)", accent: true },
  { label: "IP Address", value: "192.168.1.105" },
  { label: "MAC Address", value: "A4:83:E7:2F:1D:9C" },
];

export const DEVICE_BANDWIDTH: {
  label: string;
  detail: string;
  value: string;
}[] = [
  { label: "Today's Consumption", detail: "80% downstream", value: "2.4 GB" },
  {
    label: "Weekly Consumption",
    detail: "Consistent load pattern",
    value: "12.8 GB",
  },
  {
    label: "Monthly Consumption",
    detail: "Peak: Apr 22 (Update day)",
    value: "48.2 GB",
  },
];

/** Link-state events; `kind` picks the pill colour and label. */
export const DEVICE_NETWORK_EVENTS: {
  id: string;
  kind: "connect" | "disconnect" | "system";
  title: string;
  detail: string;
  timestamp: string;
}[] = [
  {
    id: "net-1",
    kind: "connect",
    title: "Connected to SpiceWorks-5G",
    detail: "Negotiated speed: 866 Mbps, Channel 149",
    timestamp: "2026-04-26 15:10",
  },
  {
    id: "net-2",
    kind: "system",
    title: "DHCP IP Lease Renewal",
    detail: "Assigned IP: 192.168.1.105 (Subnet Mask: 255.255.255.0)",
    timestamp: "2026-04-26 12:00",
  },
  {
    id: "net-3",
    kind: "disconnect",
    title: "Disconnected from corporate LAN",
    detail: "WiFi switched active - Ethernet link state lost",
    timestamp: "2026-04-25 18:30",
  },
  {
    id: "net-4",
    kind: "system",
    title: "Ethernet Link Down",
    detail: "Internal Realtek controller link speed renegotiated to 0",
    timestamp: "2026-04-25 18:30",
  },
];

/** One row in the System Activity History table. */
export interface HistoryRow {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  category: string;
  details: string;
}

export const DEVICE_HISTORY: HistoryRow[] = [
  { id: "h1", date: "2026-04-28", time: "14:32", user: "Cirie Fields", action: "Device Assigned", category: "Hardware", details: "Assigned Dell Latitude 5520 to Alex Rivera" },
  { id: "h2", date: "2026-04-28", time: "11:15", user: "Automated", action: "OS Update", category: "Software", details: "macOS 14.4.2 update detected on 3 devices" },
  { id: "h3", date: "2026-04-27", time: "09:43", user: "Sarah Chen", action: "Ticket Resolved", category: "Tickets", details: "Resolved TK-1015: VPN connection drops" },
  { id: "h4", date: "2026-04-26", time: "16:20", user: "Automated", action: "Software Install", category: "Software", details: "Adobe Creative Cloud updated from 12.2.2 to 12.5.6" },
  { id: "h5", date: "2026-04-26", time: "10:05", user: "Mike Johnson", action: "Network Change", category: "Network", details: "WiFi access point AP-3F reconfigured" },
  { id: "h6", date: "2026-04-25", time: "15:43", user: "Automated", action: "System Scan", category: "Hardware", details: "Full system diagnostic completed on 12 devices" },
  { id: "h7", date: "2026-04-25", time: "08:30", user: "Izzy Fields", action: "Note Added", category: "General", details: "Added maintenance note for server rack B2" },
  { id: "h8", date: "2026-04-25", time: "07:10", user: "Automated", action: "Backup Completed", category: "Backup", details: "Daily backup of DC-01 completed successfully" },
  { id: "h9", date: "2026-04-24", time: "18:45", user: "Jane Doe", action: "Password Reset", category: "Security", details: "Password reset for user Alex Rivera" },
  { id: "h10", date: "2026-04-24", time: "16:12", user: "Chris Fields", action: "Firewall Rule Update", category: "Network", details: "Added new inbound rule for port 8080" },
  { id: "h11", date: "2026-04-24", time: "14:05", user: "Automated", action: "Patch Deployment", category: "Software", details: "Applied security patches to 24 Windows devices" },
  { id: "h12", date: "2026-04-24", time: "12:30", user: "Mike Johnson", action: "Printer Added", category: "Hardware", details: "Added HP LaserJet 4000 to floor 2" },
  { id: "h13", date: "2026-04-23", time: "21:15", user: "Automated", action: "System Reboot", category: "System", details: "Scheduled reboot of server DB-04" },
  { id: "h14", date: "2026-04-23", time: "19:40", user: "Sarah Chen", action: "VPN Connection", category: "Network", details: "Remote VPN connection established by Jane Doe" },
  { id: "h15", date: "2026-04-23", time: "17:20", user: "Automated", action: "Disk Space Alert", category: "System", details: "Disk usage on NAS-01 exceeded 85%" },
  { id: "h16", date: "2026-04-23", time: "15:55", user: "Chris Fields", action: "License Renewal", category: "Software", details: "Renewed Microsoft 365 licenses for 50 users" },
  { id: "h17", date: "2026-04-23", time: "13:10", user: "Automated", action: "Security Scan", category: "Security", details: "Vulnerability scan completed; 2 critical issues found" },
  { id: "h18", date: "2026-04-23", time: "11:45", user: "Jane Doe", action: "Policy Change", category: "Policy", details: "Updated password policy: 14-day rotation" },
  { id: "h19", date: "2026-04-23", time: "09:15", user: "Automated", action: "User Login", category: "Security", details: "Successful login from 192.168.1.104" },
  { id: "h20", date: "2026-04-23", time: "08:30", user: "Automated", action: "User Logout", category: "Security", details: "Session timeout for user Mike Johnson" },
  { id: "h21", date: "2026-04-22", time: "22:10", user: "Automated", action: "Backup Failed", category: "Backup", details: "Backup of DC-02 failed due to disk space" },
  { id: "h22", date: "2026-04-22", time: "18:45", user: "Sarah Chen", action: "Printer Removed", category: "Hardware", details: "Removed old HP LaserJet 3000 from floor 1" },
  { id: "h23", date: "2026-04-22", time: "16:20", user: "Mike Johnson", action: "Hardware Transfer", category: "Hardware", details: "Transferred monitor to new employee workstation" },
  { id: "h24", date: "2026-04-22", time: "14:10", user: "Automated", action: "Software Update", category: "Software", details: "Updated Chrome browser to version 123.0.0" },
  { id: "h25", date: "2026-04-22", time: "12:05", user: "Chris Fields", action: "Network Change", category: "Network", details: "Updated subnet mask for VLAN 10" },
  { id: "h26", date: "2026-04-22", time: "10:30", user: "Automated", action: "Security Scan", category: "Security", details: "Malware scan completed; no threats found" },
  { id: "h27", date: "2026-04-22", time: "09:15", user: "Jane Doe", action: "User Login", category: "Security", details: "Successful login from 10.0.1.42" },
  { id: "h28", date: "2026-04-22", time: "08:00", user: "Automated", action: "System Reboot", category: "System", details: "Scheduled reboot of server WEB-01" },
  { id: "h29", date: "2026-04-21", time: "23:45", user: "Automated", action: "Backup Completed", category: "Backup", details: "Weekly full backup of all databases" },
];

/** A support ticket linked to this device. */
export interface LinkedTicket {
  id: string;
  subject: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "High" | "Medium" | "Low";
  assignee: string;
  created: string;
  updated: string;
}

export const DEVICE_TICKETS: LinkedTicket[] = [
  { id: "TK-1042", subject: "External display monitor flickering periodically", status: "Open", priority: "High", assignee: "Alex Rivera", created: "2026-04-26", updated: "2m ago" },
  { id: "TK-1038", subject: "Request to install Adobe Premiere on local station", status: "In Progress", priority: "Medium", assignee: "Jane Doe", created: "2026-04-25", updated: "2h ago" },
  { id: "TK-1015", subject: "VPN connection drops every 30 minutes on corporate Wi-Fi", status: "Resolved", priority: "High", assignee: "Izzy Fields", created: "2026-04-22", updated: "1d ago" },
  { id: "TK-0998", subject: "Keyboard key replacement request (W key stick)", status: "Closed", priority: "Medium", assignee: "Unassigned", created: "2026-04-18", updated: "2d ago" },
  { id: "TK-0954", subject: "Renewal for Sketch user software license key", status: "Closed", priority: "Low", assignee: "Automated System", created: "2026-04-12", updated: "5d ago" },
];

export const DEVICE_ACTIVITY: LogEntry[] = [
  {
    id: "act-1",
    author: "Cirie Fields",
    kind: "user",
    timestamp: "2m ago",
    message: "Assigned to Alex Rivera for Marketing onboarding",
  },
  {
    id: "act-2",
    author: "Automated System",
    kind: "automated",
    timestamp: "15m ago",
    message: "OS Version Update: macOS 14.4.2 detected and cataloged",
  },
  {
    id: "act-3",
    author: "Izzy Fields",
    kind: "user",
    timestamp: "2 hours ago",
    message:
      "Ran diagnostic scan on internal NVMe controller - no bad sectors found.",
  },
];
