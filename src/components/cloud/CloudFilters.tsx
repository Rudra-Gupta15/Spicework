import { ChevronDown, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";
import { CLOUD_FILTER_OPTIONS } from "@/data/cloudAssets";
import type { CloudFilterState } from "@/types/cloud";

interface CloudFiltersProps {
  filters: CloudFilterState;
  onChange: (patch: Partial<CloudFilterState>) => void;
  onSaveFilter?: () => void;
}

/** Search + dimension filters + view actions, in one row above the table. */
export const CloudFilters = ({
  filters,
  onChange,
  onSaveFilter,
}: CloudFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input
      type="search"
      value={filters.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder="Search Cloud assets..."
      aria-label="Search cloud assets"
      leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
      size="sm"
      containerClassName="w-full sm:w-auto sm:min-w-[150px] sm:max-w-[226px] sm:flex-1"
    />

    <Select
      label="Category:"
      aria-label="Filter by category"
      options={CLOUD_FILTER_OPTIONS.category}
      value={filters.category}
      onChange={(category) => onChange({ category })}
    />

    <Select
      label="Status:"
      aria-label="Filter by status"
      options={CLOUD_FILTER_OPTIONS.status}
      value={filters.status}
      onChange={(status) => onChange({ status })}
    />

    <Select
      label="Provider:"
      aria-label="Filter by provider"
      options={CLOUD_FILTER_OPTIONS.provider}
      value={filters.provider}
      onChange={(provider) => onChange({ provider })}
    />

    <Button
      variant="brand"
      size="sm"
      className="ml-auto"
      onClick={onSaveFilter}
    >
      Save Filter
      <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
    </Button>
  </div>
);
