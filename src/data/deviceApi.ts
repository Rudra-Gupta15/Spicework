import { useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import type {
  DetailField,
  Disk,
  DeviceStorage,
  HardwareDevice,
  InstalledApp,
  LoginRecord,
  NetworkAdapter,
  Peripheral,
  Printer,
  UserAccount,
  VideoController,
} from "@/types/hardware";

/* ── Backend response shapes ──────────────────────────────────────────────
   backend/routers/devices.py ("Devices & Software (Audit DB)") and
   backend/routers/assets.py ("Asset Metadata"). */

interface RawDeviceListItem {
  id: string;
  computer_name: string;
  model_name: string;
  os_name: string;
  username: string;
  last_seen: string;
  serial_number?: string;
  ip_address?: string;
  device_type?: string;
  location?: string;
  /** Every day this device was ever audited, newest first — see `scanDays`. */
  scan_days?: string[];
}

interface RawSoftwareEntry {
  name?: string;
  version?: string;
  publisher?: string;
  install_date?: string;
  size_mb?: string;
}

interface RawUserAccount {
  username?: string;
  disabled?: string;
  home_directory?: string;
  last_login?: string;
  user_type?: string;
}

interface RawLoginHistory {
  username?: string;
  user?: string;
  domain?: string;
  logon_type?: string;
  logged_in_at?: string;
  timestamp?: string;
}

interface RawHardwareDetails {
  cpu?: string;
  ram?: string;
  disk?: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
}

interface RawGpu {
  name?: string;
  driver_version?: string;
  vram?: string;
}

interface RawDiskPartition {
  name?: string;
  type?: string;
  size_gb?: string;
  free_gb?: string;
  bootable?: string;
  health?: string;
  ssd_hdd?: string;
}

interface RawPeripheral {
  name?: string;
  type?: string;
  status?: string;
}

interface RawPrinter {
  name?: string;
  system_name?: string;
  enable_bidi?: string;
  extended_printer_status?: string;
  port_name?: string;
}

interface RawNetworkAdapter {
  name?: string;
  adapter_type?: string;
  speed?: string;
  mac_address?: string;
  ipv4?: string;
  ipv6?: string;
  gateway?: string;
  subnet_mask?: string;
  dns_servers?: string;
}

interface RawDeviceDetail {
  id: string;
  computer_name: string;
  current_user: string;
  last_audit: string;
  software_inventory: RawSoftwareEntry[];
  total: number;
  os_name: string;
  os_version: string;
  os_build: string;
  last_boot: string;
  uptime: string;
  architecture: string;
  license_status: string;
  firewall: string;
  bitlocker: string;
  secure_boot: string;
  tpm: string;
  hardware_details: RawHardwareDetails;
  /* Audit-derived fallbacks for the Overview card's asset fields — the agent can
     read these off the machine, so they stand in until someone records the
     authoritative value in Asset Metadata. */
  asset_tag?: string;
  location_info?: string;
  device_type?: string;
  life_cycle?: string;
  domain?: string;
  network_details: { ip_address?: string; gateway?: string; mac?: string }[];
  user_accounts: RawUserAccount[];
  login_history: RawLoginHistory[];
  hotfixes: unknown[];
  antivirus: string[];
  gpus: RawGpu[];
  disk_partitions: RawDiskPartition[];
  peripherals: RawPeripheral[];
  printers: RawPrinter[];
  network_adapters: RawNetworkAdapter[];
}

export interface RawAssetMetadata {
  device_id: string;
  asset_tag: string;
  owner: string;
  department: string;
  location: string;
  purchase_date: string;
  purchase_price: string;
  warranty_expiry: string;
  life_cycle_stage: string;
  vendor: string;
  notes: string;
  /**
   * A human correction of a Hardware Specification field the agent misread.
   * Empty means nothing to correct. Applied server-side (list + detail
   * endpoints in devices.py) on top of the scanned value, so `hardware_details`
   * already carries the correction by the time it reaches here — nothing on
   * this side has to merge these in itself.
   */
  cpu_override: string;
  ram_override: string;
  disk_override: string;
  serial_number_override: string;
  manufacturer_override: string;
  device_model_override: string;
  last_updated: string;
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

/* Agents write these placeholders when a probe returns nothing, so they must be
   treated as absent rather than as a real reading. */
const PLACEHOLDERS = new Set(["", "unknown", "n/a", "none", "null", "undefined"]);

const isReal = (value: string | undefined): value is string =>
  !!value && !PLACEHOLDERS.has(value.trim().toLowerCase());

/** First genuinely-populated candidate, e.g. manual asset record before audit reading. */
const firstReal = (...candidates: (string | undefined)[]) => candidates.find(isReal);

/* ── Device list — GET /devices ──────────────────────────────────────────
   Serial, IP, chassis type and location all come off the audit itself. Any
   that a given agent could not read stay "Unknown" rather than invented —
   e.g. Linux without root cannot read the DMI product serial. */

const RECENT_MS = 24 * 60 * 60 * 1000;

const deriveStatus = (lastSeen: string): HardwareDevice["status"] => {
  const parsed = Date.parse(lastSeen.replace(" ", "T"));
  if (Number.isNaN(parsed)) return "OFFLINE";
  return Date.now() - parsed <= RECENT_MS ? "ONLINE" : "OFFLINE";
};

const toHardwareDevice = (raw: RawDeviceListItem): HardwareDevice => {
  const name = raw.computer_name || raw.id;
  return {
    id: raw.id,
    name,
    type: firstReal(raw.device_type) ?? "Computer",
    manufacturer: raw.model_name?.split(" ")[0] || "Unknown",
    /* Some agents genuinely cannot read a hardware serial — Linux needs root for
       the DMI product serial. Rather than a bare "Unknown", identify the row by
       device name suffixed "(D)", so the value still points at a real machine and
       the reader can see at a glance it is a name and not a serial. */
    serialNumber: firstReal(raw.serial_number) ?? `${name} (D)`,
    status: raw.last_seen ? deriveStatus(raw.last_seen) : "OFFLINE",
    lastScan: raw.last_seen || "Unknown",
    scanDays: raw.scan_days ?? [],
    ipAddress: firstReal(raw.ip_address) ?? "—",
    osVersion: firstReal(raw.os_name) ?? "—",
    location: firstReal(raw.location) ?? "Unknown",
    assignedTo: raw.username || "Unassigned",
  };
};

const fetchDeviceList = async (): Promise<HardwareDevice[]> => {
  const data = await api.get<{ devices: RawDeviceListItem[] }>("/api/devices");
  return data.devices.map(toHardwareDevice);
};

/** Shared by the Hardware and Software inventory pages — same estate, one fetch each. */
export const useDeviceList = () => {
  const [devices, setDevices] = useState<HardwareDevice[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    fetchDeviceList()
      .then((data) => {
        if (!cancelled) setDevices(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load the device inventory."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { devices, isLoading, error };
};

/** GET /api/assets — every saved Asset Metadata record, in one call (used for
    the Warranty Expiring KPI rather than fetching per-device). */
const fetchAllAssetMetadata = async (): Promise<RawAssetMetadata[]> => {
  const data = await api.get<{ assets: RawAssetMetadata[]; total: number }>("/api/assets");
  return data.assets;
};

export const useAllAssetMetadata = () => {
  const [assets, setAssets] = useState<RawAssetMetadata[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAllAssetMetadata()
      .then((data) => {
        if (!cancelled) setAssets(data);
      })
      .catch(() => {
        /* Non-critical for the KPI row — falls back to "no data" below. */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { assets, isLoading };
};

export interface HardwareKpis {
  total: number;
  online: number;
  offline: number;
  /** Warranty on file and due within 90 days. Requires Asset Metadata to
      have been filled in for a device — there's currently no edit UI for
      that, only the read-only display on the device detail page, so this
      will read 0 until warranty dates start getting recorded somewhere. */
  warrantyExpiring: number;
}

const WARRANTY_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

/** The 4 KPI tiles above the hardware table — Total/Online/Offline match the
    table's own rows exactly; Warranty Expiring cross-references Asset Metadata. */
export const computeHardwareKpis = (
  devices: HardwareDevice[],
  assets: RawAssetMetadata[],
): HardwareKpis => {
  const online = devices.filter((d) => d.status === "ONLINE").length;
  const offline = devices.filter((d) => d.status === "OFFLINE").length;

  const now = Date.now();
  const warrantyExpiring = assets.filter((asset) => {
    if (!asset.warranty_expiry) return false;
    const due = Date.parse(asset.warranty_expiry);
    if (Number.isNaN(due)) return false;
    return due >= now && due - now <= WARRANTY_WINDOW_MS;
  }).length;

  return { total: devices.length, online, offline, warrantyExpiring };
};

/* ── Device detail — GET /api/software/{id} + GET /api/asset-metadata/{id} ── */

/** Exported for callers (e.g. the Report page) that need to compose several
    fetches themselves rather than going through the `useDeviceDetail` hook. */
export type { RawDeviceDetail };

export const fetchDeviceDetail = (deviceId: string) =>
  api.get<RawDeviceDetail>(`/api/software/${encodeURIComponent(deviceId)}`);

export const fetchAssetMetadata = async (deviceId: string): Promise<RawAssetMetadata | null> => {
  try {
    return await api.get<RawAssetMetadata>(`/api/asset-metadata/${encodeURIComponent(deviceId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
};

/** Every field `PUT /api/asset-metadata/{id}` accepts, blank until set. */
const BLANK_ASSET_METADATA: Omit<RawAssetMetadata, "device_id" | "last_updated"> = {
  asset_tag: "",
  owner: "",
  department: "",
  location: "",
  purchase_date: "",
  purchase_price: "",
  warranty_expiry: "",
  life_cycle_stage: "Active",
  vendor: "",
  notes: "",
  cpu_override: "",
  ram_override: "",
  disk_override: "",
  serial_number_override: "",
  manufacturer_override: "",
  device_model_override: "",
};

/**
 * Saves a Hardware Specification correction. The write endpoint replaces the
 * whole record rather than patching one field, so this reads whatever is on
 * file first and layers the correction on top of it — a device with no
 * record yet starts from blanks. Without this, saving a CPU correction would
 * silently wipe out this device's asset tag, owner, location and every other
 * field someone had already filled in through Asset Metadata.
 */
export const saveHardwareOverrides = async (
  deviceId: string,
  overrides: Partial<
    Pick<
      RawAssetMetadata,
      | "cpu_override"
      | "ram_override"
      | "disk_override"
      | "serial_number_override"
      | "manufacturer_override"
      | "device_model_override"
    >
  >,
): Promise<RawAssetMetadata> => {
  const current = await fetchAssetMetadata(deviceId);
  const merged = { ...BLANK_ASSET_METADATA, ...current, ...overrides };

  return api.put<RawAssetMetadata>(
    `/api/asset-metadata/${encodeURIComponent(deviceId)}`,
    merged,
  );
};

/** Used by both the Hardware detail and Software detail pages. */
export const useDeviceDetail = (deviceId: string) => {
  const [detail, setDetail] = useState<RawDeviceDetail | null>(null);
  const [asset, setAsset] = useState<RawAssetMetadata | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDeviceDetail(deviceId), fetchAssetMetadata(deviceId)])
      .then(([deviceDetail, assetMetadata]) => {
        if (cancelled) return;
        setDetail(deviceDetail);
        setAsset(assetMetadata);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load this device's details."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  return { detail, asset, isLoading, error };
};

/* ── Change log (device-diff): the last two scans compared ───────────────── */

/** One hardware/OS field that differs between the two scans. */
export interface HardwareChange {
  field: string;
  previous: string;
  current: string;
}

/** An app that appeared or disappeared between scans (a raw inventory entry). */
export interface DiffApp {
  name?: string;
  version?: string;
  publisher?: string;
  vendor?: string;
}

/** Shape of GET /api/device-diff/{id} (backend/routers/devices.py). */
export interface DeviceDiff {
  has_diff: boolean;
  scan_count: number;
  /** Present only when has_diff is false (fewer than two scans). */
  message?: string;
  previous_scan?: string;
  current_scan?: string;
  newly_installed?: DiffApp[];
  newly_removed?: DiffApp[];
  hw_changes?: HardwareChange[];
  summary?: {
    installed_count: number;
    removed_count: number;
    hw_change_count: number;
  };
}

export const fetchDeviceDiff = (deviceId: string) =>
  api.get<DeviceDiff>(`/api/device-diff/${encodeURIComponent(deviceId)}`);

/** Loads the change log (current vs previous scan) for the detail pages' Logs tab. */
export const useDeviceDiff = (deviceId: string) => {
  const [diff, setDiff] = useState<DeviceDiff | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    fetchDeviceDiff(deviceId)
      .then((result) => {
        if (!cancelled) setDiff(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load the change log."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  return { diff, isLoading, error };
};

/* ── Field mappers — raw API shapes -> the UI's existing display types ──── */

const field = (key: string, label: string, value: string | undefined, note?: string): DetailField => ({
  key,
  label,
  value: isReal(value) ? value.trim() : "Unknown",
  note,
});

/** Overview tab: audit data merged with whatever Asset Metadata has on file. */
export const mapOverviewFields = (
  detail: RawDeviceDetail,
  asset: RawAssetMetadata | null,
): DetailField[] => {
  const hw = detail.hardware_details ?? {};
  // Not just [0]: older audits stored the "Unknown" sentinel for every adapter,
  // so take the first entry that carries a genuine address.
  const primaryIp = detail.network_details?.map((n) => n.ip_address).find(isReal);
  const antivirus = detail.antivirus?.length ? detail.antivirus.join(", ") : undefined;

  return [
    field("deviceName", "Device Name", detail.computer_name),
    field("operatingSystem", "Operating System", [detail.os_name, detail.os_version].filter(Boolean).join(" ")),
    field(
      "manufacturerModel",
      "Manufacturer / Model",
      [hw.manufacturer, hw.model].filter(Boolean).join(" "),
      hw.serial_number ? `S/N: ${hw.serial_number}` : undefined,
    ),
    field("architecture", "Architecture", detail.architecture),
    field("publicIp", "IP Address", primaryIp),
    field("assetTag", "Asset Tag", firstReal(asset?.asset_tag, detail.asset_tag)),
    field("owner", "Owner", firstReal(asset?.owner, detail.current_user)),
    field("department", "Department", asset?.department),
    field("location", "Location", firstReal(asset?.location, detail.location_info)),
    field("vendor", "Vendor", firstReal(asset?.vendor, hw.manufacturer)),
    field("lifeCycleStage", "Lifecycle Stage", firstReal(asset?.life_cycle_stage, detail.life_cycle)),
    field("warrantyExpiry", "Warranty Expiry", asset?.warranty_expiry),
    field("lastBoot", "Last Boot", detail.last_boot),
    field("uptime", "Uptime", detail.uptime),
    field("lastAudit", "Last Audit", detail.last_audit),
    field("licenseStatus", "License Status", detail.license_status),
    field("firewall", "Firewall", detail.firewall),
    field("bitlocker", "BitLocker", detail.bitlocker),
    field("secureBoot", "Secure Boot", detail.secure_boot),
    field("tpm", "TPM", detail.tpm),
    field("antivirus", "Security & Antivirus", antivirus),
    field("notes", "Notes", asset?.notes),
  ];
};

/** Hardware tab: CPU/RAM/disk straight off the latest audit. */
export const mapHardwareFields = (detail: RawDeviceDetail): DetailField[] => {
  const hw = detail.hardware_details ?? {};
  return [
    field("processor", "Processor (CPU)", hw.cpu),
    field("memory", "Memory (RAM)", hw.ram),
    field("disk", "Disk", hw.disk),
    field("serialNumber", "Serial Number", hw.serial_number),
    field("manufacturer", "Manufacturer", hw.manufacturer),
    field("model", "Model", hw.model),
  ];
};

export const mapApps = (detail: RawDeviceDetail | null): InstalledApp[] =>
  (detail?.software_inventory ?? []).map((entry, index) => ({
    id: `${index + 1}`,
    sequence: index + 1,
    name: entry.name || "Unknown",
    version: entry.version || "Unknown",
    publisher: entry.publisher || "Unknown",
    installDate: entry.install_date || "Unknown",
    size: entry.size_mb || "Unknown",
    lastUsed: "Unknown",
  }));

export const mapLogins = (detail: RawDeviceDetail | null): LoginRecord[] =>
  (detail?.login_history ?? []).map((entry, index) => ({
    id: `${index + 1}`,
    sequence: index + 1,
    user: entry.username || entry.user || "Unknown",
    domain: entry.domain || "Unknown",
    logonType: entry.logon_type || "Unknown",
    timestamp: entry.logged_in_at || entry.timestamp || "Unknown",
  }));

export const mapUsers = (detail: RawDeviceDetail | null): UserAccount[] =>
  (detail?.user_accounts ?? []).map((entry, index) => ({
    id: entry.username || `${index + 1}`,
    sequence: index + 1,
    username: entry.username || "Unknown",
    homeDirectory: entry.home_directory || "Unknown",
    lastLogin: entry.last_login || "Unknown",
    userType: entry.user_type || "Unknown",
    licensed: "Unknown",
    currentUser: entry.username && entry.username === detail?.current_user ? "Yes" : "No",
  }));

/** Video/GPU tab. The audit only reports one name per controller, so
    Adapter Name mirrors it and Video Processor is left "Unknown" rather
    than guessed. */
export const mapVideoControllers = (detail: RawDeviceDetail | null): VideoController[] =>
  (detail?.gpus ?? []).map((entry, index) => ({
    id: `${index + 1}`,
    sequence: index + 1,
    name: entry.name || "Unknown",
    adapterName: entry.name || "Unknown",
    videoProcessor: "Unknown",
    driverVersion: entry.driver_version || "Unknown",
  }));

/** `"952.83 GB"` -> `952.83`; anything unparsable counts as 0 toward the totals. */
const parseGb = (value: string | undefined): number => {
  const match = /([\d.]+)/.exec(value ?? "");
  return match ? parseFloat(match[1]) : 0;
};

const formatGb = (value: number): string => `${value.toFixed(2)} GB`;

/**
 * Storage tab. The audit records disk *partitions*, not separate physical
 * disks, so `disks` is left empty rather than fabricated — the summary and
 * partition table below carry the real data.
 */
export const mapStorage = (detail: RawDeviceDetail | null): DeviceStorage => {
  const partitions = detail?.disk_partitions ?? [];
  const disks: Disk[] = [];

  const totalGb = partitions.reduce((sum, p) => sum + parseGb(p.size_gb), 0);
  const freeGb = partitions.reduce((sum, p) => sum + parseGb(p.free_gb), 0);
  const ssdPartitions = partitions.filter((p) => (p.ssd_hdd ?? "").toUpperCase() === "SSD");
  const hddPartitions = partitions.filter((p) => (p.ssd_hdd ?? "").toUpperCase() === "HDD");

  return {
    summary: {
      totalStorage: totalGb ? formatGb(totalGb) : "Unknown",
      used: totalGb ? formatGb(totalGb - freeGb) : "Unknown",
      free: freeGb ? formatGb(freeGb) : "Unknown",
      ssdCount: ssdPartitions.length,
      ssdSize: formatGb(ssdPartitions.reduce((sum, p) => sum + parseGb(p.size_gb), 0)),
      hddCount: hddPartitions.length,
      hddSize: formatGb(hddPartitions.reduce((sum, p) => sum + parseGb(p.size_gb), 0)),
      physicalDisks: partitions.length,
    },
    disks,
    partitions: partitions.map((entry, index) => ({
      id: `${index + 1}`,
      name: entry.name || "Unknown",
      totalSize: entry.size_gb || "Unknown",
      used: entry.size_gb && entry.free_gb
        ? formatGb(parseGb(entry.size_gb) - parseGb(entry.free_gb))
        : "Unknown",
      freeSpace: entry.free_gb || "Unknown",
      fileSystem: entry.type || "Unknown",
      bootable: entry.bootable || "Unknown",
    })),
  };
};

export const mapNetworkAdapters = (detail: RawDeviceDetail | null): NetworkAdapter[] =>
  (detail?.network_adapters ?? []).map((entry, index) => ({
    id: `${index + 1}`,
    name: entry.name || "Unknown",
    description: entry.name || "Unknown",
    macAddress: entry.mac_address || "Unknown",
    ipv4: entry.ipv4 || "Unknown",
    ipv6: entry.ipv6 || "Unknown",
    subnetMask: entry.subnet_mask || "Unknown",
    gateway: entry.gateway || "Unknown",
    dnsDomain: "Unknown",
    dnsServers: entry.dns_servers || "Unknown",
    dhcpServer: "Unknown",
    mtu: "Unknown",
    speed: entry.speed || "Unknown",
    type: entry.adapter_type || "Unknown",
  }));

export const mapPeripherals = (detail: RawDeviceDetail | null): Peripheral[] =>
  (detail?.peripherals ?? []).map((entry, index) => ({
    id: `${index + 1}`,
    sequence: index + 1,
    type: entry.type || "Unknown",
    name: entry.name || "Unknown",
    description: entry.name || "Unknown",
    manufacturer: "Unknown",
    version: "Unknown",
  }));

export const mapPrinters = (detail: RawDeviceDetail | null): Printer[] =>
  (detail?.printers ?? []).map((entry, index) => ({
    id: `${index + 1}`,
    sequence: index + 1,
    name: entry.name || "Unknown",
    systemName: entry.system_name || "Unknown",
    portName: entry.port_name || "Unknown",
    status: entry.extended_printer_status || "Unknown",
    bidirectional: entry.enable_bidi || "Unknown",
  }));

/* ── On-demand rescan ─────────────────────────────────────────────────────
   Agents are not reachable inbound — each sits behind its office's NAT — so
   this leaves a flag the machine's own watcher collects on its next poll
   (every ~2 minutes). The scan itself then takes a minute or two, so the
   inventory will not change the instant the button is pressed. */

export interface RescanResult {
  status: string;
  device_id: string;
  computer_name?: string;
  message?: string;
}

export const requestRescan = (deviceId: string) =>
  api.post<RescanResult>(`/api/trigger-scan/${encodeURIComponent(deviceId)}`);

/* ── Scan history ─────────────────────────────────────────────────────────
   The device list collapses a machine's audits into one row per (name, OS
   family), so a dual-booted box shows twice and every earlier scan sits
   behind whichever was latest. This is the trail behind that row. */

export interface DeviceScan {
  id: string;
  osName: string;
  osVersion: string;
  username: string;
  ipAddress: string;
  /** What the machine's own clock said when it ran. */
  scannedAt: string;
  /** When the server filed it — the order the list is sorted by. */
  recordedAt: string;
}

export interface DeviceScanHistory {
  device: string;
  /** Full count, which can exceed `scans.length` when the page is capped. */
  total: number;
  scans: DeviceScan[];
}

interface RawDeviceScan {
  id: string;
  os_name?: string;
  os_version?: string;
  current_username?: string;
  ip_address?: string | null;
  execution_datetime?: string;
  created_at: string;
}

/** Every audit one machine has filed, newest first. `identifier` is its
    computer name (or MAC). */
export const fetchDeviceScans = async (
  identifier: string,
  limit = 100,
): Promise<DeviceScanHistory> => {
  const data = await api.get<{
    device: string;
    total: number;
    scans: RawDeviceScan[];
  }>(`/api/devices/${encodeURIComponent(identifier)}/scans?limit=${limit}`);

  return {
    device: data.device,
    total: data.total,
    scans: (data.scans ?? []).map((raw) => ({
      id: raw.id,
      osName: raw.os_name || "Unknown",
      osVersion: raw.os_version || "",
      username: raw.current_username || "Unknown",
      ipAddress: raw.ip_address || "—",
      scannedAt: raw.execution_datetime || raw.created_at,
      recordedAt: raw.created_at,
    })),
  };
};
