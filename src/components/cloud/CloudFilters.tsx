import { Search } from "lucide-react";

import { SaveFilterMenu } from "@/components/common/SaveFilterMenu";
import { Input, Select } from "@/components/ui";
import { CLOUD_FILTER_OPTIONS } from "@/data/cloudAssets";
import type { ExportFormat } from "@/lib/exportRows";
import type { CloudFilterState } from "@/types/cloud";

interface CloudFiltersProps {
  filters: CloudFilterState;
  onChange: (patch: Partial<CloudFilterState>) => void;
  /** Saves the current selection immediately — no naming dialog. */
  onSaveFilter?: () => void;
  isSavingFilter?: boolean;
  /** Writes the matched services out as a file. */
  onExport?: (format: ExportFormat) => void;
  /** How many services the filter matches, quoted on the export items. */
  matchCount: number;
}

/** Search + dimension filters + view actions, in one row above the table. */
export const CloudFilters = ({
  filters,
  onChange,
  onSaveFilter,
  isSavingFilter = false,
  onExport,
  matchCount,
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

    <div className="ml-auto">
      <SaveFilterMenu
        onSaveFilter={onSaveFilter}
        isSaving={isSavingFilter}
        onExport={onExport}
        rowCount={matchCount}
      />
    </div>
  </div>
);
