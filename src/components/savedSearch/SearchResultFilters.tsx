import { Search } from "lucide-react";

import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { Input, Select } from "@/components/ui";
import type {
  SearchResultFilterOptions,
  SearchResultFilterState,
} from "@/data/savedSearchResults";

interface SearchResultFiltersProps {
  filters: SearchResultFilterState;
  onChange: (patch: Partial<SearchResultFilterState>) => void;
  /** Status/Type/Manufacturer choices, drawn from the result set. */
  options: SearchResultFilterOptions;
  isFiltered: boolean;
  onClear: () => void;
}

/**
 * Narrows what a saved search returned, without touching the search itself.
 * The saved query is what matched when it was saved; this is for reading
 * that answer — "of those, the Dells nothing has scanned this week".
 */
export const SearchResultFilters = ({
  filters,
  onChange,
  options,
  isFiltered,
  onClear,
}: SearchResultFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input
      type="search"
      value={filters.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder="Search these results..."
      aria-label="Search these results"
      leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
      size="sm"
      containerClassName="w-full sm:w-auto sm:min-w-[150px] sm:max-w-[240px] sm:flex-1"
    />

    <Select
      label="Status:"
      aria-label="Filter results by status"
      options={options.status}
      value={filters.status}
      onChange={(status) => onChange({ status })}
    />

    <Select
      label="Type:"
      aria-label="Filter results by type"
      options={options.type}
      value={filters.type}
      onChange={(type) => onChange({ type })}
    />

    <Select
      label="Manufacturer:"
      aria-label="Filter results by manufacturer"
      options={options.manufacturer}
      value={filters.manufacturer}
      onChange={(manufacturer) => onChange({ manufacturer })}
    />

    <DateRangeFilter
      label="Last Scan"
      value={filters.lastScan}
      onChange={(lastScan) => onChange({ lastScan })}
    />

    {isFiltered && (
      <button
        type="button"
        onClick={onClear}
        className="ml-auto rounded px-1 text-[13px] font-semibold text-auth-panel transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-auth-panel/25 focus-visible:outline-none"
      >
        Clear filters
      </button>
    )}
  </div>
);
