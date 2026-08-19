import {
  ALL_TIME,
  isDateRangeActive,
  matchesDateRange,
  type DateRange,
} from "@/lib/dateRange";
import type { SearchResultDevice } from "@/types/savedSearch";

/*
 * The result rows themselves are produced by `savedSearchRun`, which re-runs a
 * saved query against the live estate. What remains here is the bar that
 * narrows an already-open result set — a separate concern from the saved query
 * itself, and one that never rewrites it.
 */

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
