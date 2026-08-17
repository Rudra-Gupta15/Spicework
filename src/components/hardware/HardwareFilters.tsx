import { ChevronDown, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";
import type { HardwareFilterOptions } from "@/data/hardware";
import type { HardwareFilterState } from "@/types/hardware";

interface HardwareFiltersProps {
  filters: HardwareFilterState;
  onChange: (patch: Partial<HardwareFilterState>) => void;
  /** Type/Status/Manufacturer choices, derived from the loaded devices. */
  options: HardwareFilterOptions;
  /** Saves the current selection immediately — no naming dialog. */
  onSaveFilter?: () => void;
  isSavingFilter?: boolean;
  onCustomizeView?: () => void;
}

/** Search + dimension filters + view actions, in one row above the table. */
export const HardwareFilters = ({
  filters,
  onChange,
  options,
  onSaveFilter,
  isSavingFilter = false,
  onCustomizeView,
}: HardwareFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input
      type="search"
      value={filters.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder="Search hardware devices..."
      aria-label="Search hardware devices"
      leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
      size="sm"
      containerClassName="w-full sm:w-auto sm:min-w-[150px] sm:max-w-[226px] sm:flex-1"
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

    <div className="ml-auto flex items-center gap-2">
      <Button
        variant="brand"
        size="sm"
        onClick={onSaveFilter}
        isLoading={isSavingFilter}
      >
        Save Filter
        {!isSavingFilter && <ChevronDown className="h-4 w-4" strokeWidth={2.2} />}
      </Button>

      <Button variant="brand" size="sm" onClick={onCustomizeView}>
        Customize View
      </Button>
    </div>
  </div>
);
