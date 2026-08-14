import { Activity, ClipboardList, Monitor, ShieldAlert } from "lucide-react";

import type {
  ActivityItem,
  BarPoint,
  DeviceAudit,
  OsBreakdownRow,
  Segment,
} from "@/types/dashboard";
import type { StatMetric } from "@/types/ui";

/** Mock data — swap these exports for API responses later. */

export const STAT_METRICS: StatMetric[] = [
  {
    id: "total-devices",
    label: "Total Devices",
    value: "612",
    icon: Monitor,
    tone: "info",
    delta: { value: "+18 YTD", direction: "up", isPositive: true },
  },
  {
    id: "critical-alerts",
    label: "Critical Alerts",
    value: "3",
    icon: ShieldAlert,
    tone: "danger",
    delta: { value: "-2% vs last 7 days", direction: "down", isPositive: true },
  },
  {
    id: "pending-scan",
    label: "Pending Scan",
    value: "12",
    icon: ClipboardList,
    tone: "warning",
    delta: {
      value: "+14.3% vs last 7 days",
      direction: "up",
      isPositive: true,
    },
  },
  {
    id: "total-scan",
    label: "Total Scan",
    value: "600",
    icon: Activity,
    tone: "success",
    delta: { value: "+0.1%", direction: "up", isPositive: true },
  },
];

export const COMPLIANCE = {
  score: 85,
  target: 90,
  delta: "8%",
  breakdown: [
    {
      id: "compliant",
      label: "Compliant",
      value: 85,
      color: "var(--color-status-online)",
    },
    {
      id: "non-compliant",
      label: "Non-Compliant",
      value: 7,
      color: "var(--color-status-offline)",
    },
    {
      id: "pending",
      label: "Pending Review",
      value: 5,
      color: "var(--color-status-maintenance)",
    },
    {
      id: "exempt",
      label: "Exempt",
      value: 3,
      color: "var(--color-status-neutral)",
    },
  ] satisfies Segment[],
};

export const ACTIVE_DEVICES = {
  total: "1,240",
  lastUpdated: "May 28",
  ranges: ["Daily", "Weekly", "Monthly"],
  series: [
    { label: "May 24", value: 760 },
    { label: "May 25", value: 830 },
    { label: "May 26", value: 880 },
    { label: "May 27", value: 940 },
    { label: "May 28", value: 960 },
    { label: "May 29", value: 990 },
    { label: "May 30", value: 995 },
  ] satisfies BarPoint[],
};

export const OS_BREAKDOWN = {
  total: "1,240",
  rows: [
    {
      id: "windows",
      label: "Windows",
      value: 612,
      share: "49.4%",
      color: "var(--color-chart-1)",
    },
    {
      id: "linux",
      label: "Linux",
      value: 312,
      share: "25.2%",
      color: "var(--color-chart-2)",
    },
    {
      id: "network",
      label: "Network Devices",
      value: 96,
      share: "7.7%",
      color: "var(--color-chart-3)",
    },
    {
      id: "vm",
      label: "Virtual Machines",
      value: 52,
      share: "4.2%",
      color: "var(--color-chart-4)",
    },
    {
      id: "others",
      label: "Others",
      value: 20,
      share: "1.6%",
      color: "var(--color-chart-5)",
    },
  ] satisfies OsBreakdownRow[],
};

export const DEVICE_AUDITS: DeviceAudit[] = [
  {
    id: "srv-prod-01",
    device: "SRV-PROD-01",
    ip: "192.168.1.1",
    os: "Windows Server 2019",
    auditedOn: "May 02, 2025",
    score: 91.8,
    status: "Pass",
  },
  {
    id: "ubuntsrv-05-02",
    device: "UBUNTSRV-05-02",
    ip: "192.168.1.45",
    os: "Ubuntu 22.04 LTS",
    auditedOn: "May 02, 2025",
    score: 88.5,
    status: "Pass",
  },
  {
    id: "centos-db-01",
    device: "CENTOS-DB-01",
    ip: "10.0.1.12",
    os: "CentOS 7",
    auditedOn: "May 02, 2025",
    score: 72.4,
    status: "Fail",
  },
  {
    id: "mis-app-23",
    device: "MIS-APP-23",
    ip: "10.0.1.55",
    os: "Red Hat Enterprise 8",
    auditedOn: "May 02, 2025",
    score: 95.1,
    status: "Pass",
  },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "assignment",
    actor: "Cirie Fields",
    tag: "Assignment",
    tagTone: "info",
    time: "2m ago",
    description: "Assigned Dell Latitude 5520 to Alex Rivera",
  },
  {
    id: "os-update",
    actor: "Automated",
    tag: "OS Update",
    tagTone: "success",
    time: "15m ago",
    description: "OS Update detected on 3 devices",
  },
];
