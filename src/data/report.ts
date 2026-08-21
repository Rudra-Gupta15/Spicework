import { useEffect, useState } from "react";

import {
  fetchAssetMetadata,
  fetchDeviceDetail,
  fetchRowOverrides,
  mapApps,
  mapHardwareFields,
  mapNetworkAdapters,
  mapPeripherals,
  mapPrinters,
  mapStorage,
  mapUsers,
  mapVideoControllers,
  type RawAssetMetadata,
  type RawDeviceDetail,
  type SectionRowOverrides,
} from "./deviceApi";
import {
  ALL_TIME,
  isDateRangeActive,
  matchesDateRangeAny,
  reportedDays,
} from "@/lib/dateRange";
import { api } from "@/lib/api";
import type { HardwareDevice } from "@/types/hardware";
import type {
  ReportCategory,
  ReportFilterState,
  ReportPreview,
  ReportScope,
  ReportSection,
  ReportSystem,
} from "@/types/report";

export const REPORT_CATEGORIES: ReportCategory[] = ["Hardware", "Software"];

/** Header row label for the per-category count column. */
export const RECORD_LABEL: Record<ReportCategory, string> = {
  Hardware: "Components",
  Software: "Applications",
};

/* --- who a report is for ------------------------------------------ */

/**
 * A report is the team's by default — anybody who can open the page can pull
 * it. Marking one Private keeps it to whoever did: the machine under
 * investigation, the director's laptop, the licence audit nobody else needs
 * to stumble into.
 *
 * Held in a module-level map, the same way the admin area holds its sites: a
 * change mutates it in place and every screen reading it on mount picks the
 * change up. Swap for the API once reports are stored server-side.
 */
const SCOPES = new Map<string, ReportScope>();

export const DEFAULT_REPORT_SCOPE: ReportScope = "Public";

/** Extra option on the filter bar; never a value a report is saved with. */
export const ALL_SCOPES = "All Scopes";

export const REPORT_SCOPE_OPTIONS: readonly string[] = [
  ALL_SCOPES,
  "Public",
  "Private",
];

export const reportScope = (systemId: string): ReportScope =>
  SCOPES.get(systemId) ?? DEFAULT_REPORT_SCOPE;

export const setReportScope = (systemId: string, scope: ReportScope): void => {
  SCOPES.set(systemId, scope);
};

/** The picker table's rows, before per-row record counts are known. */
export const reportSystems = (
  devices: HardwareDevice[],
  pinnedIds: ReadonlySet<string> = new Set(),
): ReportSystem[] =>
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
    scanDays: device.scanDays,
    pinned: pinnedIds.has(device.id),
    records: 0,
    scope: reportScope(device.id),
  }));

/* --- pinning a system to the top of the list ------------------------ */

/**
 * App-wide, not per-user — the same reach `reportScope` already has. "Show
 * this one above everyone else" reads oddly as something only you can see;
 * a pin is meant to be found by whoever opens Reports next.
 */
const fetchPinnedIds = (category: ReportCategory) =>
  api
    .get<{ system_ids: string[] }>(`/api/report-pins/${encodeURIComponent(category)}`)
    .then((data) => data.system_ids);

const setSystemPinned = (
  category: ReportCategory,
  systemId: string,
  pinned: boolean,
): Promise<unknown> =>
  pinned
    ? api.put(`/api/report-pins/${encodeURIComponent(category)}/${encodeURIComponent(systemId)}`)
    : api.delete(`/api/report-pins/${encodeURIComponent(category)}/${encodeURIComponent(systemId)}`);

/**
 * The pinned ids for one Reports category, and a toggle that updates the
 * server and the local set together.
 *
 * The set is applied optimistically — flipped in state before the request
 * resolves — so the star responds the instant it's clicked rather than
 * waiting on a round trip; a failed request reverts it and surfaces the
 * error rather than leaving the UI claiming a pin that never saved.
 */
export const useReportPins = (category: ReportCategory) => {
  const [pinnedIds, setPinnedIds] = useState<ReadonlySet<string>>(new Set());
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Resetting for a fresh fetch on category change, not a render-time
    // update — the rule can't tell the two apart.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    /* Cleared up front rather than left to the fetch: Hardware and Software
       both build their rows from the same device ids, so without this a
       switch between tabs would show the old tab's pins on the new one
       until the request resolves. */
    setPinnedIds(new Set());
    fetchPinnedIds(category)
      .then((ids) => {
        if (!cancelled) setPinnedIds(new Set(ids));
      })
      .catch(() => {
        /* Falls back to nothing pinned rather than an error banner — pins
           are a convenience, not core data the page depends on. */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const togglePin = async (systemId: string, pinned: boolean) => {
    setPinnedIds((current) => {
      const next = new Set(current);
      if (pinned) next.add(systemId);
      else next.delete(systemId);
      return next;
    });

    try {
      await setSystemPinned(category, systemId, pinned);
    } catch (error) {
      /* Revert: the server never confirmed it, so the star should not either. */
      setPinnedIds((current) => {
        const next = new Set(current);
        if (pinned) next.delete(systemId);
        else next.add(systemId);
        return next;
      });
      throw error;
    }
  };

  return { pinnedIds, isLoading, togglePin };
};

/* --- narrowing the list -------------------------------------------- */

const ALL = "All";

export const DEFAULT_REPORT_FILTERS: ReportFilterState = {
  search: "",
  type: ALL,
  status: ALL,
  manufacturer: ALL,
  scope: ALL_SCOPES,
  lastScan: ALL_TIME,
};

export interface ReportFilterOptions {
  type: string[];
  status: string[];
  manufacturer: string[];
  /** Every day a loaded system was last scanned on, newest first. */
  lastScanDays: string[];
}

/**
 * Dropdown choices derived from the systems actually loaded, so every option
 * matches something in the table — the same rule the inventory bars follow.
 */
export const reportFilterOptions = (
  systems: ReportSystem[],
): ReportFilterOptions => {
  const distinct = (pick: (system: ReportSystem) => string): string[] => [
    ALL,
    ...[...new Set(systems.map(pick).filter(Boolean))].sort(),
  ];

  return {
    type: distinct((system) => system.type),
    status: distinct((system) => system.status),
    manufacturer: distinct((system) => system.manufacturer),
    lastScanDays: reportedDays(systems.flatMap((system) => system.scanDays)),
  };
};

/** True when a filter would narrow the list. */
export const isReportFiltered = (filters: ReportFilterState): boolean =>
  filters.search.trim() !== "" ||
  filters.type !== ALL ||
  filters.status !== ALL ||
  filters.manufacturer !== ALL ||
  filters.scope !== ALL_SCOPES ||
  isDateRangeActive(filters.lastScan);

/** Applies the filter bar to the systems a report can be generated for. */
export const filterReportSystems = (
  systems: ReportSystem[],
  { search, type, status, manufacturer, scope, lastScan }: ReportFilterState,
): ReportSystem[] => {
  const term = search.trim().toLowerCase();

  const matched = systems.filter(
    (system) =>
      (type === ALL || system.type === type) &&
      (status === ALL || system.status === status) &&
      (manufacturer === ALL || system.manufacturer === manufacturer) &&
      (scope === ALL_SCOPES || system.scope === scope) &&
      matchesDateRangeAny(system.scanDays, lastScan) &&
      (term === "" ||
        `${system.name} ${system.type} ${system.manufacturer} ${system.serialNumber} ${system.assignedTo}`
          .toLowerCase()
          .includes(term)),
  );

  /* A stable sort (guaranteed by the spec since ES2019), so this only moves
     pinned rows to the front — it never reorders within either group, which
     would otherwise fight whatever order the rows already carried. */
  return matched.sort((a, b) => Number(b.pinned) - Number(a.pinned));
};

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
              (detail.user_accounts?.length ?? 0) +
              (detail.printers?.length ?? 0) +
              (detail.gpus?.length ?? 0);
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

/** `RawAssetMetadata` column -> the Hardware Specification label it corrects. */
const SPEC_OVERRIDE_LABELS: [keyof RawAssetMetadata, string][] = [
  ["cpu_override", "Processor (CPU)"],
  ["ram_override", "Memory (RAM)"],
  ["disk_override", "Disk"],
  ["serial_number_override", "Serial Number"],
  ["manufacturer_override", "Manufacturer"],
  ["device_model_override", "Model"],
];

const buildHardwareReport = (
  device: HardwareDevice,
  detail: RawDeviceDetail,
  asset: RawAssetMetadata | null,
  rowOverrides: Record<string, SectionRowOverrides> = {},
): ReportPreview => {
  const assetTag = asset?.asset_tag ?? "";
  const specification = mapHardwareFields(detail);
  const storage = mapStorage(detail, rowOverrides.storage);
  const adapters = mapNetworkAdapters(detail, rowOverrides.network);
  const peripherals = mapPeripherals(detail, rowOverrides.peripherals);
  const printers = mapPrinters(detail, rowOverrides.printers);
  const video = mapVideoControllers(detail, rowOverrides.video);
  const users = mapUsers(detail, rowOverrides.users);

  /* Labels of the Specification fields with a saved correction — the
     mechanism behind them (`asset_metadata`) is different from the list
     sections' row overrides, but the badge they both feed is the same. */
  const correctedSpecLabels = SPEC_OVERRIDE_LABELS.filter(
    ([column]) => (asset?.[column] || "").trim(),
  ).map(([, label]) => label);

  return {
    id: `hardware-${device.id}`,
    category: "Hardware",
    title: `Hardware Report — ${device.name}`,
    subtitle: `${device.manufacturer} · ${device.type}${assetTag ? ` · Asset ${assetTag}` : ""}`,
    subject: device.name,
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
        correctedRowKeys: correctedSpecLabels,
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
        correctedRowKeys: storage.partitions
          .filter((partition) => partition.manuallyCorrected)
          .map((partition) => partition.name),
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
        correctedRowKeys: adapters
          .filter((adapter) => adapter.manuallyCorrected)
          .map((adapter) => adapter.macAddress),
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
        correctedRowKeys: peripherals
          .filter((peripheral) => peripheral.manuallyCorrected)
          .map((peripheral) => peripheral.name),
      },
      {
        id: "printers",
        title: "Printers",
        columns: ["#", "Name", "System Name", "Port", "Status", "Bidirectional"],
        rows: printers.map((printer, index) => [
          (index + 1).toString(),
          printer.name,
          printer.systemName,
          printer.portName,
          printer.status,
          printer.bidirectional,
        ]),
        correctedRowKeys: printers
          .filter((printer) => printer.manuallyCorrected)
          .map((printer) => printer.name),
      },
      {
        id: "video",
        title: "Video Controllers",
        columns: ["#", "Name", "Adapter", "Video Processor", "Driver Version"],
        rows: video.map((controller, index) => [
          (index + 1).toString(),
          controller.name,
          controller.adapterName,
          controller.videoProcessor,
          controller.driverVersion,
        ]),
        correctedRowKeys: video
          .filter((controller) => controller.manuallyCorrected)
          .map((controller) => controller.name),
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
        correctedRowKeys: users
          .filter((user) => user.manuallyCorrected)
          .map((user) => user.username),
      },
    ]),
  };
};

const buildSoftwareReport = (
  device: HardwareDevice,
  detail: RawDeviceDetail,
): ReportPreview => {
  const apps = mapApps(detail);
  const users = mapUsers(detail);

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
    subject: device.name,
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
      {
        id: "users",
        title: "User Accounts",
        /* Licensed and Current User are the two fields this side of the app
           actually cares about — see `UserAccount` — so they lead the
           columns the hardware-side Users section doesn't carry. */
        columns: ["#", "Username", "Licensed", "Current User", "Last Login", "User Type"],
        rows: users.map((user, index) => [
          (index + 1).toString(),
          user.username,
          user.licensed,
          user.currentUser,
          user.lastLogin,
          user.userType,
        ]),
      },
    ]),
  };
};

/**
 * A copy of the report holding only the picked sections — what "select which
 * parts to download" produces. The overview strip (title, subtitle, Report
 * Summary) always comes along regardless of the selection: it is the minimum
 * context that says what the file even is, not one of the parts being
 * chosen between.
 *
 * An empty `sectionIds` is read as "everything" rather than "nothing" — the
 * one caller of this with an empty list is a report that has not looked at
 * the picker yet, and a report that downloads as blank sections the moment
 * the screen opens would be a worse default than just not filtering.
 */
/**
 * How one Hardware Report list section's columns map onto the typed field a
 * correction actually has to set — see `applyRowOverrides` in deviceApi.ts.
 * `rowKeyColumn` names which column is that row's stable identity: the one
 * value a correction is filed under so it keeps finding the same row after
 * the agent regenerates this list on the next scan.
 *
 * Not every displayed column is here on purpose. "#" is a position, not a
 * field, and correcting it would mean nothing next time the list reorders.
 */
export interface SectionEditConfig {
  rowKeyColumn: string;
  /** Column header -> typed field name used for override storage. */
  fieldForColumn: Record<string, string>;
}

export const HARDWARE_SECTION_EDIT_CONFIG: Record<string, SectionEditConfig> = {
  storage: {
    rowKeyColumn: "Name",
    fieldForColumn: {
      Name: "name",
      "File System": "fileSystem",
      Size: "totalSize",
      "Free Space": "freeSpace",
      Bootable: "bootable",
    },
  },
  network: {
    rowKeyColumn: "MAC Address",
    fieldForColumn: {
      Adapter: "name",
      "MAC Address": "macAddress",
      IPv4: "ipv4",
      Gateway: "gateway",
      Speed: "speed",
      Type: "type",
    },
  },
  peripherals: {
    rowKeyColumn: "Name",
    fieldForColumn: {
      Type: "type",
      Name: "name",
      Manufacturer: "manufacturer",
      Version: "version",
    },
  },
  printers: {
    rowKeyColumn: "Name",
    fieldForColumn: {
      Name: "name",
      "System Name": "systemName",
      Port: "portName",
      Status: "status",
      Bidirectional: "bidirectional",
    },
  },
  video: {
    rowKeyColumn: "Name",
    fieldForColumn: {
      Name: "name",
      Adapter: "adapterName",
      "Video Processor": "videoProcessor",
      "Driver Version": "driverVersion",
    },
  },
  users: {
    rowKeyColumn: "Username",
    fieldForColumn: {
      Username: "username",
      "Home Directory": "homeDirectory",
      "Last Login": "lastLogin",
      "User Type": "userType",
    },
  },
};

/**
 * Which column of each section carries a row's identity — the one the
 * "manually corrected" badge attaches to. Specification has no row-edit
 * config of its own (it uses `EditHardwareSpecModal`, not
 * `EditSectionRowsModal`), so it is listed here on its own rather than
 * folded into `HARDWARE_SECTION_EDIT_CONFIG` above.
 */
export const SECTION_IDENTITY_COLUMN: Record<string, string> = {
  specification: "Specification",
  storage: "Name",
  network: "MAC Address",
  peripherals: "Name",
  printers: "Name",
  video: "Name",
  users: "Username",
};

export const reportWithSections = (
  report: ReportPreview,
  sectionIds: string[],
): ReportPreview =>
  sectionIds.length === 0
    ? report
    : {
        ...report,
        sections: report.sections.filter((section) => sectionIds.includes(section.id)),
      };

/** Fetches the device's latest audit (and asset tag) and builds the report it previews/exports. */
export const buildReport = async (
  category: ReportCategory,
  device: HardwareDevice,
): Promise<ReportPreview> => {
  const [detail, asset, rowOverrides] = await Promise.all([
    fetchDeviceDetail(device.id),
    fetchAssetMetadata(device.id),
    fetchRowOverrides(device.id),
  ]);

  return category === "Software"
    ? buildSoftwareReport(device, detail)
    : buildHardwareReport(device, detail, asset, rowOverrides);
};

/* --- reporting on several systems at once --------------------------- */

/** How many devices are audited at a time — each one is two fetches. */
const BUILD_BATCH = 5;

export interface BulkReportResult {
  reports: ReportPreview[];
  /** Names of the systems whose audit could not be read. */
  failed: string[];
}

/**
 * Builds one report per picked system. A device that cannot be reached is
 * collected in `failed` rather than sinking the whole download — the rest
 * of the selection is still worth having.
 */
export const buildReports = async (
  category: ReportCategory,
  devices: HardwareDevice[],
): Promise<BulkReportResult> => {
  const result: BulkReportResult = { reports: [], failed: [] };

  for (let start = 0; start < devices.length; start += BUILD_BATCH) {
    const batch = await Promise.all(
      devices.slice(start, start + BUILD_BATCH).map(
        async (device): Promise<{ report?: ReportPreview; failed?: string }> => {
          try {
            return { report: await buildReport(category, device) };
          } catch {
            return { failed: device.name };
          }
        },
      ),
    );

    batch.forEach(({ report, failed }) => {
      if (report) result.reports.push(report);
      if (failed) result.failed.push(failed);
    });
  }

  return result;
};
