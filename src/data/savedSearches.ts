import { useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import {
  ALL_TIME,
  isDateRangeActive,
  matchesDateRange,
  type DateRange,
} from "@/lib/dateRange";
import type {
  SavedSearch,
  SavedSearchCategory,
  SavedSearchScope,
} from "@/types/savedSearch";

export const SAVED_SEARCH_TABS: SavedSearchCategory[] = [
  "Hardware",
  "Software",
  "Cloud Assets",
  "Network",
];

export const SAVED_SEARCH_SCOPES = ["Public", "Private"] as const;

/* --- filtering the list itself ------------------------------------ */

/** Extra option on the scope filter; never a value a search can hold. */
const ALL_SCOPES = "All Scopes";

export const SAVED_SEARCH_SCOPE_OPTIONS: readonly string[] = [
  ALL_SCOPES,
  ...SAVED_SEARCH_SCOPES,
];

/** Active values of the saved-search filter bar. */
export interface SavedSearchFilterState {
  search: string;
  scope: string;
  /** When the search was saved — the list grows by date, so it narrows by it. */
  created: DateRange;
}

export const DEFAULT_SAVED_SEARCH_FILTERS: SavedSearchFilterState = {
  search: "",
  scope: ALL_SCOPES,
  created: ALL_TIME,
};

/** True when a filter would narrow the list — drives the empty message. */
export const isSavedSearchFiltered = (
  filters: SavedSearchFilterState,
): boolean =>
  filters.search.trim() !== "" ||
  filters.scope !== ALL_SCOPES ||
  isDateRangeActive(filters.created);

/**
 * Narrows one tab's Filter Search. The free-text term is matched against
 * the name, the dimensions the query filters on and who saved it — the three
 * things somebody would have in mind when hunting for one they made earlier.
 */
export const filterSavedSearches = (
  searches: SavedSearch[],
  filters: SavedSearchFilterState,
): SavedSearch[] => {
  const term = filters.search.trim().toLowerCase();

  return searches.filter(
    (search) =>
      (filters.scope === ALL_SCOPES || search.scope === filters.scope) &&
      matchesDateRange(search.created, filters.created) &&
      (term === "" ||
        `${search.name} ${search.filters} ${search.createdBy}`
          .toLowerCase()
          .includes(term)),
  );
};

/**
 * What the "Create New" dialog opens pre-filled with when there's no active
 * filter state to seed it from (e.g. opened directly from the Saved Search
 * page rather than from a filter bar's "Save Filter" button).
 */
export const DEFAULT_SEARCH_DRAFT: Record<
  SavedSearchCategory,
  { name: string; filters: string[] }
> = {
  Hardware: { name: "", filters: [] },
  Software: { name: "", filters: [] },
  "Cloud Assets": { name: "", filters: [] },
  Network: { name: "", filters: [] },
};

/** Dimension names a filter chip contributes, e.g. "Type: Laptop" -> "Type". */
export const filtersLabel = (filters: string[]): string =>
  filters.length === 0
    ? "None"
    : filters.map((filter) => filter.split(":")[0].trim()).join(", ");

/** Today, in the "Aug 15, 2026" format Filter Search are named/dated with. */
export const todayLabel = (): string =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/**
 * Auto-generated name for a filter saved straight from a list page's filter
 * bar — no naming dialog, so the chips themselves have to say what it is.
 */
export const autoFilterName = (
  category: SavedSearchCategory,
  chips: string[],
): string =>
  chips.length === 0 ? `All ${category} — ${todayLabel()}` : chips.join(" · ");

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error
    ? error.message
    : fallback;

interface RawSavedSearch {
  id: string;
  category: string;
  name: string;
  scope: string;
  applied_filters: string[];
  /** The filter bar's own state, so the search can be re-run on current data. */
  filter_state?: Record<string, unknown> | null;
  results_count: number;
  created_by: string;
  created_at: string;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const toSavedSearch = (raw: RawSavedSearch): SavedSearch => ({
  id: raw.id,
  name: raw.name,
  scope: raw.scope as SavedSearchScope,
  filters: filtersLabel(raw.applied_filters),
  appliedFilters: raw.applied_filters,
  filterState: raw.filter_state ?? undefined,
  results: raw.results_count,
  createdBy: raw.created_by,
  created: formatDate(raw.created_at),
  createdAt: raw.created_at,
});

/** GET /api/saved-searches?category= */
export const fetchSavedSearches = async (
  category: SavedSearchCategory,
): Promise<SavedSearch[]> => {
  const data = await api.get<{ searches: RawSavedSearch[] }>(
    `/api/saved-searches?category=${encodeURIComponent(category)}`,
  );
  return data.searches.map(toSavedSearch);
};

/** GET /api/saved-searches/{id} — also returns which category it belongs to. */
export const fetchSavedSearchById = async (
  id: string,
): Promise<{ category: SavedSearchCategory; search: SavedSearch } | null> => {
  try {
    const raw = await api.get<RawSavedSearch>(
      `/api/saved-searches/${encodeURIComponent(id)}`,
    );
    return {
      category: raw.category as SavedSearchCategory,
      search: toSavedSearch(raw),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
};

/** POST /api/saved-searches */
export const createSavedSearch = async (
  category: SavedSearchCategory,
  draft: {
    name: string;
    scope: SavedSearchScope;
    filters: string[];
    /** Structured filter bar state — what the search actually re-runs with. */
    filterState?: Record<string, unknown>;
    resultsCount: number;
    createdBy: string;
  },
): Promise<SavedSearch> => {
  const raw = await api.post<RawSavedSearch>("/api/saved-searches", {
    category,
    name: draft.name,
    scope: draft.scope,
    applied_filters: draft.filters,
    filter_state: draft.filterState ?? null,
    results_count: draft.resultsCount,
    created_by: draft.createdBy,
  });
  return toSavedSearch(raw);
};

/** DELETE /api/saved-searches/{id} */
export const deleteSavedSearch = (id: string) =>
  api.delete<{ status: string }>(
    `/api/saved-searches/${encodeURIComponent(id)}`,
  );

export const useSavedSearches = (category: SavedSearchCategory) => {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchSavedSearches(category)
      .then((data) => {
        if (!cancelled) setSearches(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(errorMessage(err, "Could not load Filter Search."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, reloadTick]);

  const reload = () => setReloadTick((n) => n + 1);

  return { searches, isLoading, error, reload };
};

/* ── Grouping repeat saves ────────────────────────────────────────────────
   An unfiltered save is named "All <category> — <today>", so saving twice in a
   day leaves rows with the same name and the same date on screen. The list
   shows one row per name; the repeats are reached from inside the search,
   where SavedSearchVersionMenu lists them by the time each was saved. */

export interface SavedSearchGroup {
  /** What the rows have in common — the name they were all saved under. */
  key: string;
  /** The most recent save; what the row itself shows and what View opens. */
  latest: SavedSearch;
  /** Every save under this name, newest first. One entry when it is not a repeat. */
  saves: SavedSearch[];
}

const savedAtMs = (search: SavedSearch): number => {
  const at = Date.parse(search.createdAt);
  return Number.isNaN(at) ? 0 : at;
};

export const groupSavedSearches = (searches: SavedSearch[]): SavedSearchGroup[] => {
  const groups = new Map<string, SavedSearch[]>();

  searches.forEach((search) => {
    const key = search.name.trim().toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), search]);
  });

  return [...groups.values()]
    .map((saves) => {
      const ordered = [...saves].sort((a, b) => savedAtMs(b) - savedAtMs(a));
      return { key: ordered[0].name, latest: ordered[0], saves: ordered };
    })
    .sort((a, b) => savedAtMs(b.latest) - savedAtMs(a.latest));
};

/** `6:34 PM` — what tells two saves made on the same day apart, since an
    unfiltered save is auto-named "All <category> — <today>". */
export const savedAtLabel = (search: SavedSearch): string => {
  const at = Date.parse(search.createdAt);
  return Number.isNaN(at)
    ? search.created
    : new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};
