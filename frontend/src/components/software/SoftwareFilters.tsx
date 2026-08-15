import { ChevronDown, Search } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";
import type { SoftwareFilterState, SoftwareInstallScope } from "@/types/software";

const INSTALL_SCOPE_OPTIONS: SoftwareInstallScope[] = ["All", "Single Device", "Multiple Devices"];

interface SoftwareFiltersProps {
  filters: SoftwareFilterState;
  onChange: (patch: Partial<SoftwareFilterState>) => void;
  /** Derived from whatever's actually loaded — there's no fixed publisher catalog. */
  publisherOptions: string[];
  /** Saves the current selection immediately — no naming dialog. */
  onSaveFilter?: () => void;
  isSavingFilter?: boolean;
  onCustomizeView?: () => void;
}

/** Search + dimension filters + view actions, mirroring HardwareFilters but
    for the fields the software inventory actually has (Publisher, install spread). */
export const SoftwareFilters = ({
  filters,
  onChange,
  publisherOptions,
  onSaveFilter,
  isSavingFilter = false,
  onCustomizeView,
}: SoftwareFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input
      type="search"
      value={filters.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder="Search by name, publisher, or device..."
      aria-label="Search installed software"
      leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
      size="sm"
      containerClassName="w-full sm:w-auto sm:min-w-[150px] sm:max-w-[260px] sm:flex-1"
    />

    <Select
      label="Publisher:"
      aria-label="Filter by publisher"
      options={publisherOptions}
      value={filters.publisher}
      onChange={(publisher) => onChange({ publisher })}
    />

    <Select
      label="Installed On:"
      aria-label="Filter by how widely installed"
      options={INSTALL_SCOPE_OPTIONS}
      value={filters.installScope}
      onChange={(installScope) => onChange({ installScope: installScope as SoftwareInstallScope })}
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
