import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

import { Input, Select } from "@/components/ui";
import {
  DATE_RANGE_PRESETS,
  ON_DATE,
  formatReportedDate,
  onDate,
  type DateRange,
  type DateRangePreset,
} from "@/lib/dateRange";

interface DateRangeFilterProps {
  /** What the dates on the rows are — "Last Scan", "Installed". */
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  /**
   * The exact days the rows carry, newest first, as `yyyy-mm-dd` — see
   * `reportedDays`. Listed under the relative windows so a person can pick the
   * day they are actually looking at. Omit for a picker with only the windows.
   */
  days?: readonly string[];
}

/**
 * The date filter as the inventory bars carry it: the usual relative windows,
 * then every day the rows in front of you were actually dated on, then two day
 * fields for a range of your own.
 *
 * The concrete days are derived from the loaded rows rather than configured, so
 * the menu grows a new entry the first time a scan lands on a new day and loses
 * one when the last machine dated to it is scanned again. Nothing here is a
 * fixed list of dates.
 *
 * Rows whose date was never reported drop out while a window is set — see
 * `matchesDateRange` for why that is the honest answer.
 */
export const DateRangeFilter = ({
  label,
  value,
  onChange,
  days = [],
}: DateRangeFilterProps) => {
  /* "Aug 19, 2026" reads as a date; the `yyyy-mm-dd` behind it is an index. */
  const dayLabels = useMemo(() => days.map(formatReportedDate), [days]);

  /* Days sit between the relative windows and Custom Range: the windows are
     the common ask, and Custom Range is the escape hatch, so it stays last
     however many days appear in between. */
  const options = useMemo(
    () => [
      ...DATE_RANGE_PRESETS.filter((preset) => preset !== "Custom Range"),
      ...dayLabels,
      "Custom Range",
    ],
    [dayLabels],
  );

  const selected =
    value.preset === ON_DATE ? formatReportedDate(value.from) : value.preset;

  const handleSelect = (option: string) => {
    const day = days[dayLabels.indexOf(option)];

    /* Switching between windows keeps whatever was typed into the two day
       fields, so glancing at "Last 7 Days" and coming back does not wipe it. */
    onChange(day ? onDate(day) : { ...value, preset: option as DateRangePreset });
  };

  return (
    <>
      <Select
        label={`${label}:`}
        aria-label={`Filter by ${label.toLowerCase()}`}
        leading={<CalendarDays className="h-4 w-4" strokeWidth={1.9} />}
        options={options}
        value={selected}
        onChange={handleSelect}
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
};
