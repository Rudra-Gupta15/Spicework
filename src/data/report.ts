import type { HardwareDevice, InstalledApp } from "@/types/hardware";
import type {
  ReportCategory,
  ReportPreview,
  ReportSection,
  ReportSystem,
} from "@/types/report";

import { HARDWARE_DEVICES } from "./hardware";
import { getTabPanel } from "./hardwareDetail";
import { getDeviceAdapters } from "./hardwareNetwork";
import { getDevicePeripherals } from "./hardwarePeripherals";
import { getDeviceStorage } from "./hardwareStorage";
import { getDeviceUsers } from "./hardwareUsers";
import { getDeviceApps } from "./softwareApps";
import { SOFTWARE_ASSETS } from "./softwareAssets";

/** Mock data — swap these exports for API responses later. */

export const REPORT_CATEGORIES: ReportCategory[] = ["Hardware", "Software"];

/** Values in the mock set carry `\n` for the detail grid; reports do not. */
const flatten = (value: string): string => value.replace(/\s*\n\s*/g, " ");

/**
 * Applications for a device. Only one device in the mock set has its own
 * scan, so the rest borrow a deterministic slice of the estate-wide list —
 * every system still previews a report with real-looking rows.
 */
const appsFor = (device: HardwareDevice): InstalledApp[] => {
  const scanned = getDeviceApps(device);
  if (scanned.length > 0) return scanned;

  const index = HARDWARE_DEVICES.findIndex((item) => item.id === device.id);
  const start = (index * 7) % SOFTWARE_ASSETS.length;
  const size = 18 + (index % 4) * 6;

  return SOFTWARE_ASSETS.slice(start, start + size).map((app, position) => ({
    ...app,
    sequence: position + 1,
  }));
};

/** How many records a report for this system would carry. */
const recordCount = (device: HardwareDevice, category: ReportCategory): number =>
  category === "Software"
    ? appsFor(device).length
    : getDevicePeripherals(device).length +
      getDeviceAdapters(device).length +
      getDeviceStorage(device).disks.length +
      getDeviceUsers(device).length;

/** The systems a report can be generated for, in list order. */
export const reportSystems = (category: ReportCategory): ReportSystem[] =>
  HARDWARE_DEVICES.map((device) => ({
    id: device.id,
    name: device.name,
    type: device.type,
    manufacturer: device.manufacturer,
    serialNumber: device.serialNumber,
    status: device.status,
    location: device.location,
    assignedTo: device.assignedTo,
    lastScan: device.lastScan,
    records: recordCount(device, category),
  }));

/** Header row label for the per-category count column. */
export const RECORD_LABEL: Record<ReportCategory, string> = {
  Hardware: "Components",
  Software: "Applications",
};

/** Timestamp printed on the report and written into the exports. */
const generatedOn = (): string =>
  new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Drops sections the scan reported nothing for. */
const withRows = (sections: ReportSection[]): ReportSection[] =>
  sections.filter((section) => section.rows.length > 0);

const buildHardwareReport = (device: HardwareDevice): ReportPreview => {
  const specification = getTabPanel(device, "Hardware")?.fields ?? [];
  const storage = getDeviceStorage(device);
  const adapters = getDeviceAdapters(device);
  const peripherals = getDevicePeripherals(device);
  const users = getDeviceUsers(device);

  return {
    id: `hardware-${device.id}`,
    category: "Hardware",
    title: `Hardware Report — ${device.name}`,
    subtitle: `${device.manufacturer} · ${device.type} · S/N ${device.serialNumber}`,
    generatedOn: generatedOn(),
    summary: [
      { label: "Device Name", value: device.name },
      { label: "Type", value: device.type },
      { label: "Manufacturer", value: device.manufacturer },
      { label: "Serial Number", value: device.serialNumber },
      { label: "Status", value: device.status },
      { label: "Operating System", value: device.osVersion },
      { label: "IP Address", value: device.ipAddress },
      { label: "Location", value: device.location },
      { label: "Assigned To", value: device.assignedTo },
      { label: "Total Storage", value: storage.summary.totalStorage },
      { label: "Physical Disks", value: storage.summary.physicalDisks.toString() },
      { label: "Last Scan", value: device.lastScan },
    ],
    sections: withRows([
      {
        id: "specification",
        title: "Hardware Specification",
        columns: ["Specification", "Value"],
        rows: specification.map((field) => [
          field.label,
          flatten(field.note ? `${field.value} (${field.note})` : field.value),
        ]),
      },
      {
        id: "storage",
        title: "Storage Devices",
        columns: [
          "#",
          "Disk",
          "Manufacturer",
          "Model",
          "Interface",
          "File System",
          "Size",
          "Used",
        ],
        rows: storage.disks.map((disk, index) => [
          (index + 1).toString(),
          disk.name,
          disk.manufacturer,
          disk.model,
          disk.interface,
          disk.fileSystem,
          disk.size,
          disk.used,
        ]),
      },
      {
        id: "network",
        title: "Network Adapters",
        columns: ["#", "Adapter", "MAC Address", "IPv4", "Gateway", "Speed", "Type"],
        rows: adapters.map((adapter, index) => [
          (index + 1).toString(),
          adapter.name,
          adapter.macAddress,
          adapter.ipv4,
          adapter.gateway,
          adapter.speed,
          adapter.type,
        ]),
      },
      {
        id: "peripherals",
        title: "Peripherals",
        columns: ["#", "Type", "Name", "Manufacturer", "Version"],
        rows: peripherals.map((peripheral, index) => [
          (index + 1).toString(),
          peripheral.type,
          peripheral.name,
          peripheral.manufacturer,
          peripheral.version,
        ]),
      },
      {
        id: "users",
        title: "User Accounts",
        columns: ["#", "Username", "Home Directory", "Last Login", "User Type"],
        rows: users.map((user, index) => [
          (index + 1).toString(),
          user.username,
          user.homeDirectory,
          user.lastLogin,
          user.userType,
        ]),
      },
    ]),
  };
};

const buildSoftwareReport = (device: HardwareDevice): ReportPreview => {
  const apps = appsFor(device);

  const byPublisher = new Map<string, number>();
  apps.forEach((app) => {
    byPublisher.set(app.publisher, (byPublisher.get(app.publisher) ?? 0) + 1);
  });

  const publishers = [...byPublisher.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  const unused = apps.filter((app) => app.lastUsed === "Unknown").length;

  return {
    id: `software-${device.id}`,
    category: "Software",
    title: `Software Report — ${device.name}`,
    subtitle: `${apps.length} applications installed · ${publishers.length} publishers`,
    generatedOn: generatedOn(),
    summary: [
      { label: "Device Name", value: device.name },
      { label: "Operating System", value: device.osVersion },
      { label: "Assigned To", value: device.assignedTo },
      { label: "Location", value: device.location },
      { label: "Total Applications", value: apps.length.toString() },
      { label: "Publishers", value: publishers.length.toString() },
      { label: "Never Used", value: unused.toString() },
      { label: "Status", value: device.status },
      { label: "IP Address", value: device.ipAddress },
      { label: "Serial Number", value: device.serialNumber },
      { label: "License Status", value: "Licensed" },
      { label: "Last Scan", value: device.lastScan },
    ],
    sections: withRows([
      {
        id: "applications",
        title: "Installed Applications",
        columns: [
          "#",
          "Application",
          "Version",
          "Publisher",
          "Install Date",
          "Size",
          "Last Used",
        ],
        rows: apps.map((app, index) => [
          (index + 1).toString(),
          app.name,
          app.version,
          app.publisher,
          app.installDate,
          app.size,
          app.lastUsed,
        ]),
      },
      {
        id: "publishers",
        title: "Publisher Breakdown",
        columns: ["#", "Publisher", "Applications", "Share"],
        rows: publishers.map(([publisher, count], index) => [
          (index + 1).toString(),
          publisher,
          count.toString(),
          `${Math.round((count / apps.length) * 100)}%`,
        ]),
      },
    ]),
  };
};

/** Generates the report a system's row previews and exports. */
export const buildReport = (
  category: ReportCategory,
  systemId: string,
): ReportPreview | null => {
  const device = HARDWARE_DEVICES.find((item) => item.id === systemId);
  if (!device) return null;

  return category === "Software"
    ? buildSoftwareReport(device)
    : buildHardwareReport(device);
};
