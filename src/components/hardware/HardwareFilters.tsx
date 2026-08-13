import { ChevronDown, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";
import { HARDWARE_FILTER_OPTIONS } from "@/data/hardware";
import type { HardwareFilterState } from "@/types/hardware";

interface HardwareFiltersProps {
  filters: HardwareFilterState;
  onChange: (patch: Partial<HardwareFilterState>) => void;
  onSaveFilter?: () => void;
  onCustomizeView?: () => void;
}

/** Search + dimension filters + view actions, in one row above the table. */
export const HardwareFilters = ({
  filters,
  onChange,
  onSaveFilter,
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
      options={HARDWARE_FILTER_OPTIONS.type}
      value={filters.type}
      onChange={(type) => onChange({ type })}
    />

    <Select
      label="Status:"
      aria-label="Filter by status"
      options={HARDWARE_FILTER_OPTIONS.status}
      value={filters.status}
      onChange={(status) => onChange({ status })}
    />

    <Select
      label="Manufacturer:"
      aria-label="Filter by manufacturer"
      options={HARDWARE_FILTER_OPTIONS.manufacturer}
      value={filters.manufacturer}
      onChange={(manufacturer) => onChange({ manufacturer })}
    />

    <div className="ml-auto flex items-center gap-2">
      <Button variant="brand" size="sm" onClick={onSaveFilter}>
        Save Filter
        <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
      </Button>

      <Button variant="brand" size="sm" onClick={onCustomizeView}>
        Customize View
      </Button>
    </div>
  </div>
);
