import { Search } from "lucide-react";

import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { Input, Select } from "@/components/ui";
import { REPORT_SCOPE_OPTIONS, type ReportFilterOptions } from "@/data/report";
import type { ReportCategory, ReportFilterState } from "@/types/report";

interface ReportFiltersProps {
  /** Which tab is open — only used to word the search box. */
  category: ReportCategory;
  filters: ReportFilterState;
  onChange: (patch: Partial<ReportFilterState>) => void;
  /** Type/Status/Manufacturer choices, derived from the loaded systems. */
  options: ReportFilterOptions;
  /** Shown only while something is narrowed. */
  isFiltered: boolean;
  onClear: () => void;
}

/**
 * The report list's filter bar, matching the inventory ones dimension for
 * dimension. Both tabs get the same controls on purpose: a Hardware report
 * and a Software report are generated for the same systems, so "which of my
 * machines" is the same question whichever tab is open.
 */
export const ReportFilters = ({
  category,
  filters,
  onChange,
  options,
  isFiltered,
  onClear,
}: ReportFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input
      type="search"
      value={filters.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder={`Search ${category.toLowerCase()} systems...`}
      aria-label={`Search ${category.toLowerCase()} systems`}
      leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
      size="sm"
      containerClassName="w-full sm:w-auto sm:min-w-[150px] sm:max-w-[240px] sm:flex-1"
    />

    <Select
      label="Type:"
      aria-label="Filter by type"
      options={options.type}
      value={filters.type}
      onChange={(type) => onChange({ type })}
    />

    <Select
      label="Status:"
      aria-label="Filter by status"
      options={options.status}
      value={filters.status}
      onChange={(status) => onChange({ status })}
    />

    <Select
      label="Manufacturer:"
      aria-label="Filter by manufacturer"
      options={options.manufacturer}
      value={filters.manufacturer}
      onChange={(manufacturer) => onChange({ manufacturer })}
    />

    {/* Who the report is for — a Private one is only listed for whoever
        marked it that way. */}
    <Select
      label="Scope:"
      aria-label="Filter by scope"
      options={REPORT_SCOPE_OPTIONS}
      value={filters.scope}
      onChange={(scope) => onChange({ scope })}
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
