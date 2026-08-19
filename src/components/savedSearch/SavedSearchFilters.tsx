import { Search } from "lucide-react";

import { Input, Select } from "@/components/ui";
import { SAVED_SEARCH_SCOPE_OPTIONS } from "@/data/savedSearches";
import type { SavedSearchFilterState } from "@/data/savedSearches";

interface SavedSearchFiltersProps {
  filters: SavedSearchFilterState;
  onChange: (patch: Partial<SavedSearchFilterState>) => void;
  /** Shown on the right — how many of the tab's searches are left. */
  matchCount: number;
  totalCount: number;
}

/**
 * Search + scope, above the saved-search list. Mirrors the inventory filter
 * bars, minus the save/export actions: this list is already the saved
 * filters, so there is nothing here worth saving as another one.
 */
export const SavedSearchFilters = ({
  filters,
  onChange,
  matchCount,
  totalCount,
}: SavedSearchFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input
      type="search"
      value={filters.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder="Search by name, filter or who saved it..."
      aria-label="Search Filter Search"
      leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
      size="sm"
      containerClassName="w-full sm:w-auto sm:min-w-[150px] sm:max-w-[300px] sm:flex-1"
    />

    <Select
      label="Scope:"
      aria-label="Filter by scope"
      options={SAVED_SEARCH_SCOPE_OPTIONS}
      value={filters.scope}
      onChange={(scope) => onChange({ scope })}
    />

    <p className="ml-auto text-[13px] text-muted">
      {matchCount === totalCount
        ? `${totalCount} saved`
        : `${matchCount} of ${totalCount} saved`}
    </p>
  </div>
);
