import {
  fetchAssetMetadata,
  fetchDeviceDetail,
  mapApps,
  mapHardwareFields,
  mapNetworkAdapters,
  mapPeripherals,
  mapStorage,
  mapUsers,
  type RawDeviceDetail,
} from "./deviceApi";
import type { HardwareDevice } from "@/types/hardware";
import type {
  ReportCategory,
  ReportPreview,
  ReportSection,
  ReportSystem,
} from "@/types/report";

export const REPORT_CATEGORIES: ReportCategory[] = ["Hardware", "Software"];

/** Header row label for the per-category count column. */
export const RECORD_LABEL: Record<ReportCategory, string> = {
  Hardware: "Components",
  Software: "Applications",
};

/** The picker table's rows, before per-row record counts are known. */
export const reportSystems = (devices: HardwareDevice[]): ReportSystem[] =>
  devices.map((device) => ({
    id: device.id,
    name: device.name,
    type: device.type,
    manufacturer: device.manufacturer,
    serialNumber: device.serialNumber,
    status: device.status,
    location: device.location,
    assignedTo: device.assignedTo,
    lastScan: device.lastScan,
    records: 0,
  }));

/**
 * Record counts require a full detail fetch, which is too expensive to run
 * for the whole estate — so it's only ever called for the current page of
 * visible rows (a handful of devices), not the full list.
 */
export const fetchRecordCounts = async (
  devices: HardwareDevice[],
  category: ReportCategory,
): Promise<Record<string, number>> => {
  const entries = await Promise.all(
    devices.map(async (device): Promise<[string, number]> => {
      try {
        const detail = await fetchDeviceDetail(device.id);
        const count =
          category === "Software"
            ? (detail.software_inventory?.length ?? 0)
            : (detail.peripherals?.length ?? 0) +
              (detail.network_adapters?.length ?? 0) +
              (detail.disk_partitions?.length ?? 0) +
              (detail.user_accounts?.length ?? 0);
        return [device.id, count];
      } catch {
        return [device.id, 0];
      }
    }),
  );
  return Object.fromEntries(entries);
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

const buildHardwareReport = (
  device: HardwareDevice,
  detail: RawDeviceDetail,
  assetTag: string,
): ReportPreview => {
  const specification = mapHardwareFields(detail);
  const storage = mapStorage(detail);
  const adapters = mapNetworkAdapters(detail);
  const peripherals = mapPeripherals(detail);
  const users = mapUsers(detail);

  return {
    id: `hardware-${device.id}`,
    category: "Hardware",
    title: `Hardware Report — ${device.name}`,
    subtitle: `${device.manufacturer} · ${device.type}${assetTag ? ` · Asset ${assetTag}` : ""}`,
    generatedOn: generatedOn(),
    summary: [
      { label: "Device Name", value: device.name },
      { label: "Type", value: device.type },
      { label: "Manufacturer", value: device.manufacturer },
      { label: "Serial Number", value: detail.hardware_details?.serial_number || "Unknown" },
      { label: "Status", value: device.status },
      { label: "Operating System", value: `${detail.os_name} ${detail.os_version}`.trim() },
      { label: "IP Address", value: detail.network_details?.[0]?.ip_address || "Unknown" },
      { label: "Asset Tag", value: assetTag || "Unassigned" },
      { label: "Last Audit", value: detail.last_audit || "Unknown" },
      { label: "Total Storage", value: storage.summary.totalStorage },
      { label: "Partitions", value: storage.summary.physicalDisks.toString() },
      { label: "License Status", value: detail.license_status || "Unknown" },
    ],
    sections: withRows([
      {
        id: "specification",
        title: "Hardware Specification",
        columns: ["Specification", "Value"],
        rows: specification.map((field) => [field.label, field.value]),
      },
      {
        id: "storage",
        title: "Disk Partitions",
        columns: ["#", "Name", "File System", "Size", "Free Space", "Bootable"],
        rows: storage.partitions.map((partition, index) => [
          (index + 1).toString(),
          partition.name,
          partition.fileSystem,
          partition.totalSize,
          partition.freeSpace,
          partition.bootable,
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

const buildSoftwareReport = (
  device: HardwareDevice,
  detail: RawDeviceDetail,
): ReportPreview => {
  const apps = mapApps(detail);

  const byPublisher = new Map<string, number>();
  apps.forEach((app) => {
    byPublisher.set(app.publisher, (byPublisher.get(app.publisher) ?? 0) + 1);
  });

  const publishers = [...byPublisher.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  return {
    id: `software-${device.id}`,
    category: "Software",
    title: `Software Report — ${device.name}`,
    subtitle: `${apps.length} applications installed · ${publishers.length} publishers`,
    generatedOn: generatedOn(),
    summary: [
      { label: "Device Name", value: device.name },
      { label: "Operating System", value: `${detail.os_name} ${detail.os_version}`.trim() },
      { label: "Current User", value: detail.current_user || "Unknown" },
      { label: "Total Applications", value: apps.length.toString() },
      { label: "Publishers", value: publishers.length.toString() },
      { label: "Status", value: device.status },
      { label: "Firewall", value: detail.firewall || "Unknown" },
      { label: "BitLocker", value: detail.bitlocker || "Unknown" },
      { label: "License Status", value: detail.license_status || "Unknown" },
      { label: "Last Audit", value: detail.last_audit || "Unknown" },
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
          apps.length ? `${Math.round((count / apps.length) * 100)}%` : "0%",
        ]),
      },
    ]),
  };
};

/** Fetches the device's latest audit (and asset tag) and builds the report it previews/exports. */
export const buildReport = async (
  category: ReportCategory,
  device: HardwareDevice,
): Promise<ReportPreview> => {
  const [detail, asset] = await Promise.all([
    fetchDeviceDetail(device.id),
    fetchAssetMetadata(device.id),
  ]);

  return category === "Software"
    ? buildSoftwareReport(device, detail)
    : buildHardwareReport(device, detail, asset?.asset_tag ?? "");
};
