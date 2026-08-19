import {
  ALL_TIME,
  isDateRangeActive,
  matchesDateRange,
  type DateRange,
} from "@/lib/dateRange";
import type { SavedSearch, SearchResultDevice } from "@/types/savedSearch";

/** Mock data — swap these exports for API responses later. */

/** Hardware estate the Filter Search run against. */
const HARDWARE_POOL: SearchResultDevice[] = [
  {
    id: "d1",
    name: "Dell Latitude 5520",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "Dell",
    serial: "SN-DL5520-3891",
    lastScan: "2 mins ago",
  },
  {
    id: "d2",
    name: "Dell XPS 15 9520",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "Dell",
    serial: "SN-XPS15-7823",
    lastScan: "15 mins ago",
  },
  {
    id: "d3",
    name: "HP EliteBook 840 G9",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "HP",
    serial: "SN-EB840-4521",
    lastScan: "1 hour ago",
  },
  {
    id: "d4",
    name: "Dell Inspiron 14 5420",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "Dell",
    serial: "SN-IN14-1187",
    lastScan: "2 hours ago",
  },
  {
    id: "d5",
    name: "HP ProBook 450 G10",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "HP",
    serial: "SN-PB450-6634",
    lastScan: "3 hours ago",
  },
  {
    id: "d6",
    name: "Dell Precision 5570",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "Dell",
    serial: "SN-PR5570-9012",
    lastScan: "5 hours ago",
  },
  {
    id: "d7",
    name: "HP ZBook Fury 16 G9",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "HP",
    serial: "SN-ZB16-3345",
    lastScan: "1 day ago",
  },
  {
    id: "d8",
    name: "Dell Vostro 3520",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "Dell",
    serial: "SN-VS3520-5578",
    lastScan: "1 day ago",
  },
  /* These are filtered out by the "Online Laptops - Dell & HP" query. */
  {
    id: "d9",
    name: "Lenovo ThinkPad X1",
    status: "ONLINE",
    type: "Laptop",
    manufacturer: "Lenovo",
    serial: "SN-TP-X1-4402",
    lastScan: "20 mins ago",
  },
  {
    id: "d10",
    name: "Dell OptiPlex 7090",
    status: "ONLINE",
    type: "Desktop",
    manufacturer: "Dell",
    serial: "SN-OP7090-2210",
    lastScan: "40 mins ago",
  },
  {
    id: "d11",
    name: "HP EliteDesk 800",
    status: "OFFLINE",
    type: "Desktop",
    manufacturer: "HP",
    serial: "SN-ED800-6651",
    lastScan: "3 days ago",
  },
  {
    id: "d12",
    name: "Dell Latitude 7420",
    status: "OFFLINE",
    type: "Laptop",
    manufacturer: "Dell",
    serial: "SN-DL7420-9930",
    lastScan: "6 days ago",
  },
];

/** Splits `"Manufacturer: Dell, HP"` into `["dell", "hp"]`. */
const chipValues = (chip: string): string[] =>
  (chip.split(":")[1] ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const chipKey = (chip: string): string =>
  chip.split(":")[0].trim().toLowerCase();

/**
 * Runs a set of `label: value` chips against the hardware pool. Type and
 * Manufacturer match any of their listed values; Status matches exactly.
 */
export const runHardwareSearch = (
  appliedFilters: string[],
): SearchResultDevice[] =>
  HARDWARE_POOL.filter((device) =>
    appliedFilters.every((chip) => {
      const values = chipValues(chip);
      if (values.length === 0) return true;

      switch (chipKey(chip)) {
        case "type":
          return values.includes(device.type.toLowerCase());
        case "status":
          return values.includes(device.status.toLowerCase());
        case "manufacturer":
          return values.includes(device.manufacturer.toLowerCase());
        default:
          return true;
      }
    }),
  );

/**
 * Result rows for a search. A hardware query with known filters runs against
 * the pool; anything else falls back to the first `results` pool rows so the
 * count still lines up with the list.
 */
export const resultsForSearch = (search: SavedSearch): SearchResultDevice[] => {
  if (search.appliedFilters) return runHardwareSearch(search.appliedFilters);
  return HARDWARE_POOL.slice(0, search.results);
};

/* --- narrowing a result set --------------------------------------- */

/**
 * A saved search answers "which machines matched when I saved this"; the bar
 * above the results answers "and which of those am I looking at now". The
 * two are deliberately separate — narrowing here never rewrites the search.
 */
export interface SearchResultFilterState {
  search: string;
  status: string;
  type: string;
  manufacturer: string;
  /** When a scan last reached the device — rows read "3 days ago" and such. */
  lastScan: DateRange;
}

const ALL = "All";

export const DEFAULT_RESULT_FILTERS: SearchResultFilterState = {
  search: "",
  status: ALL,
  type: ALL,
  manufacturer: ALL,
  lastScan: ALL_TIME,
};

export interface SearchResultFilterOptions {
  status: string[];
  type: string[];
  manufacturer: string[];
}

/** Choices drawn from the result set itself, so no option matches nothing. */
export const resultFilterOptions = (
  results: SearchResultDevice[],
): SearchResultFilterOptions => {
  const distinct = (pick: (device: SearchResultDevice) => string): string[] => [
    ALL,
    ...[...new Set(results.map(pick).filter(Boolean))].sort(),
  ];

  return {
    status: distinct((device) => device.status),
    type: distinct((device) => device.type),
    manufacturer: distinct((device) => device.manufacturer),
  };
};

/** True when the bar would narrow the result set. */
export const isResultFiltered = (filters: SearchResultFilterState): boolean =>
  filters.search.trim() !== "" ||
  filters.status !== ALL ||
  filters.type !== ALL ||
  filters.manufacturer !== ALL ||
  isDateRangeActive(filters.lastScan);

export const filterResults = (
  results: SearchResultDevice[],
  { search, status, type, manufacturer, lastScan }: SearchResultFilterState,
): SearchResultDevice[] => {
  const term = search.trim().toLowerCase();

  return results.filter(
    (device) =>
      (status === ALL || device.status === status) &&
      (type === ALL || device.type === type) &&
      (manufacturer === ALL || device.manufacturer === manufacturer) &&
      matchesDateRange(device.lastScan, lastScan) &&
      (term === "" ||
        `${device.name} ${device.type} ${device.manufacturer} ${device.serial}`
          .toLowerCase()
          .includes(term)),
  );
};
