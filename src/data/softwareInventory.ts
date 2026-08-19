import { useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import { ALL_TIME, isDateRangeActive, matchesDateRange } from "@/lib/dateRange";
import type {
  SoftwareColumnKey,
  SoftwareFilterState,
  SoftwareInventoryItem,
} from "@/types/software";

/* GET /api/software-inventory — backend/legacy_db.py's list_software_inventory(). */
interface RawSoftwareInstall {
  id: string;
  name: string;
}

interface RawSoftwareInventoryItem {
  name: string;
  version: string;
  publisher: string;
  install_date: string;
  size_mb: string;
  install_count: number;
  devices: RawSoftwareInstall[];
}

/**
 * Chrome-installed PWAs (Chrome Remote Desktop, YouTube, X, …) get registered
 * by Windows with a literal `"Google\Chrome"` publisher string — real data,
 * not a scan bug, but not a useful filter option either. Collapse anything
 * with that shape down to the company name in front of the backslash.
 */
const normalizePublisher = (raw: string): string => {
  const trimmed = raw.trim();
  const backslash = trimmed.indexOf("\\");
  return backslash === -1 ? trimmed : trimmed.slice(0, backslash).trim() || trimmed;
};

const toItem = (raw: RawSoftwareInventoryItem, index: number): SoftwareInventoryItem => ({
  id: `${index}`,
  name: raw.name,
  version: raw.version,
  publisher: normalizePublisher(raw.publisher || "Unknown"),
  installDate: raw.install_date,
  size: raw.size_mb,
  installCount: raw.install_count,
  devices: raw.devices,
  installedOn: raw.devices.map((d) => d.name).join(", "),
});

const fetchSoftwareInventory = async (): Promise<SoftwareInventoryItem[]> => {
  const data = await api.get<{ software: RawSoftwareInventoryItem[] }>("/api/software-inventory");
  return data.software.map(toItem);
};

/** The estate-wide software list — every distinct app+version installed across every device. */
export const useSoftwareInventory = () => {
  const [items, setItems] = useState<SoftwareInventoryItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    fetchSoftwareInventory()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError || err instanceof Error
              ? err.message
              : "Could not load the software inventory.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, isLoading, error };
};

/** Every column the inventory table can render — drives the Customize View dialog too. */
export const SOFTWARE_INVENTORY_COLUMNS: {
  key: SoftwareColumnKey;
  label: string;
  visibleByDefault: boolean;
}[] = [
  { key: "name", label: "Application Name", visibleByDefault: true },
  { key: "version", label: "Version", visibleByDefault: true },
  { key: "publisher", label: "Publisher", visibleByDefault: true },
  { key: "installCount", label: "Installed On (devices)", visibleByDefault: true },
  { key: "installDate", label: "Install Date", visibleByDefault: false },
  { key: "size", label: "Size", visibleByDefault: false },
  { key: "installedOn", label: "Devices", visibleByDefault: true },
];

export const DEFAULT_SOFTWARE_INVENTORY_COLUMNS: SoftwareColumnKey[] = SOFTWARE_INVENTORY_COLUMNS.filter(
  (column) => column.visibleByDefault,
).map((column) => column.key);

const ALL = "All";

export const DEFAULT_SOFTWARE_FILTERS: SoftwareFilterState = {
  search: "",
  publisher: ALL,
  installScope: ALL,
  installed: ALL_TIME,
};

/** True when a filter would narrow the result set. */
export const isSoftwareFiltered = (filters: SoftwareFilterState): boolean =>
  filters.search.trim() !== "" ||
  filters.publisher !== ALL ||
  filters.installScope !== ALL ||
  isDateRangeActive(filters.installed);

/** Publisher options, derived from whatever's actually in the fetched list —
    there's no fixed catalog to draw them from like Hardware's mock data has. */
export const softwareFilterOptions = (items: SoftwareInventoryItem[]) => ({
  publisher: [ALL, ...[...new Set(items.map((item) => item.publisher))].sort()],
});

export const filterSoftware = (
  items: SoftwareInventoryItem[],
  { search, publisher, installScope, installed }: SoftwareFilterState,
): SoftwareInventoryItem[] => {
  const term = search.trim().toLowerCase();

  return items.filter((item) => {
    if (publisher !== ALL && item.publisher !== publisher) return false;
    if (installScope === "Single Device" && item.installCount !== 1) return false;
    if (installScope === "Multiple Devices" && item.installCount <= 1) return false;
    /* Install dates come off the scan as `YYYYMMDD`, or "Unknown" for an app
       that never reported one. */
    if (!matchesDateRange(item.installDate, installed)) return false;
    if (term === "") return true;
    return `${item.name} ${item.version} ${item.publisher} ${item.installedOn}`
      .toLowerCase()
      .includes(term);
  });
};

export interface SoftwareKpis {
  softwareCount: number;
  publisherCount: number;
  largest: { label: string; size: string } | null;
  topDevice: { name: string; count: number } | null;
}

/** `"2,712.71"` -> `2712.71`; unparseable ("Unknown", "System", …) -> null. */
const parseSizeMb = (raw: string): number | null => {
  const value = parseFloat(raw.replace(/,/g, ""));
  return Number.isNaN(value) ? null : value;
};

/**
 * The 4 KPI tiles above the software table — every value derived from the
 * same list the table itself shows, so they can never disagree with it.
 */
export const computeSoftwareKpis = (items: SoftwareInventoryItem[]): SoftwareKpis => {
  const publisherCount = new Set(items.map((item) => item.publisher)).size;

  let largest: SoftwareKpis["largest"] = null;
  let largestMb = -Infinity;
  for (const item of items) {
    const mb = parseSizeMb(item.size);
    if (mb !== null && mb > largestMb) {
      largestMb = mb;
      largest = { label: `${item.name} ${item.version}`, size: `${mb.toLocaleString()} MB` };
    }
  }

  // Keyed by device *name*, not id — a dual-booted machine reports a
  // different id (MAC) per OS, and should still count as one device here,
  // same reasoning as the Dashboard's Total Devices tile.
  const perDevice = new Map<string, { name: string; count: number }>();
  for (const item of items) {
    for (const device of item.devices) {
      const key = device.name.trim().toLowerCase();
      const entry = perDevice.get(key) ?? { name: device.name, count: 0 };
      entry.count += 1;
      perDevice.set(key, entry);
    }
  }
  let topDevice: SoftwareKpis["topDevice"] = null;
  for (const entry of perDevice.values()) {
    if (!topDevice || entry.count > topDevice.count) topDevice = entry;
  }

  return { softwareCount: items.length, publisherCount, largest, topDevice };
};
