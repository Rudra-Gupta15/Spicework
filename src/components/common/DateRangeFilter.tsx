import { CalendarDays } from "lucide-react";

import { Input, Select } from "@/components/ui";
import {
  DATE_RANGE_PRESETS,
  type DateRange,
  type DateRangePreset,
} from "@/lib/dateRange";

interface DateRangeFilterProps {
  /** What the dates on the rows are — "Last Scan", "Installed". */
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/**
 * The date filter as the inventory bars carry it: one picker of the usual
 * windows, and two day fields that appear only once somebody asks for a
 * range of their own. Rows whose date was never reported drop out while a
 * window is set — see `matchesDateRange` for why that is the honest answer.
 */
export const DateRangeFilter = ({
  label,
  value,
  onChange,
}: DateRangeFilterProps) => (
  <>
    <Select
      label={`${label}:`}
      aria-label={`Filter by ${label.toLowerCase()}`}
      leading={<CalendarDays className="h-4 w-4" strokeWidth={1.9} />}
      options={DATE_RANGE_PRESETS}
      value={value.preset}
      onChange={(preset) =>
        onChange({ ...value, preset: preset as DateRangePreset })
      }
    />

    {value.preset === "Custom Range" && (
      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          size="sm"
          value={value.from}
          max={value.to || undefined}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
          aria-label={`${label} from`}
          containerClassName="w-[150px]"
        />
        <span className="text-[13px] text-muted" aria-hidden="true">
          to
        </span>
        <Input
          type="date"
          size="sm"
          value={value.to}
          min={value.from || undefined}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
          aria-label={`${label} to`}
          containerClassName="w-[150px]"
        />
      </div>
    )}
  </>
);
