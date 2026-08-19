/** Asset category a saved search belongs to — one per tab. */
export type SavedSearchCategory =
  | "Hardware"
  | "Software"
  | "Cloud Assets"
  | "Network";

/** Whether a saved search is visible to the whole team or just its owner. */
export type SavedSearchScope = "Public" | "Private";

/** One stored query in the saved-search list. */
export interface SavedSearch {
  id: string;
  name: string;
  scope: SavedSearchScope;
  /** Comma-separated filter dimensions, already formatted for display. */
  filters: string;
  /** Full `label: value` chips the query runs with, when known. */
  appliedFilters?: string[];
  /** The filter bar state it was saved from, replayed to re-run the query. */
  filterState?: Record<string, unknown>;
  /** Matches the query returned last time it ran. */
  results: number;
  createdBy: string;
  /** Creation date, already formatted for display. */
  created: string;
}

/** One row in a hardware saved-search result set. */
export interface SearchResultDevice {
  id: string;
  name: string;
  status: "ONLINE" | "OFFLINE";
  type: string;
  manufacturer: string;
  serial: string;
  /** Last audit time, already formatted for display. */
  lastScan: string;
}
