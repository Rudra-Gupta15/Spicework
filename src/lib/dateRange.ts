/**
 * The date filter both inventories share.
 *
 * Dates arrive here in whatever shape the thing that reported them used: the
 * agent writes `20260729`, the audit log writes `2026-08-14 10:22:31`, the
 * mock estate writes `Jul 30 2026`, and anything never seen writes "Unknown"
 * or "Never". A filter that only understood one of those would quietly hide
 * rows, so the reader below takes all of them and says so when it cannot.
 *
 * (`lib/bulkImport` has its own, stricter date reader on purpose: an upload
 * is held to the two formats its template documents, because guessing at
 * what somebody typed is how 03/04 becomes the wrong month.)
 */

/** The windows offered, in the order the picker lists them. */
export const DATE_RANGE_PRESETS = [
  "All Time",
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "This Year",
  "Custom Range",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

/** A chosen window. `from`/`to` are `yyyy-mm-dd` and only used by Custom. */
export interface DateRange {
  preset: DateRangePreset;
  from: string;
  to: string;
}

/** No window at all — what a filter bar starts on. */
export const ALL_TIME: DateRange = { preset: "All Time", from: "", to: "" };

/** True when the range would actually narrow anything. */
export const isDateRangeActive = (range: DateRange): boolean =>
  range.preset !== "All Time" &&
  (range.preset !== "Custom Range" || range.from !== "" || range.to !== "");

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/** Local midnight of a day, which is the grain every window works at. */
const dayStart = (year: number, month: number, day: number): number | undefined => {
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date.getTime()
    : undefined;
};

/** Values that mean "there is no date here", not "the date is missing". */
const NOT_A_DATE = new Set(["", "unknown", "never", "n/a", "-", "—"]);

/**
 * A reported date as local midnight of the day it names, or undefined when
 * the value does not carry one. Time of day is dropped: a filter reading
 * "Last 7 Days" is about days, and keeping the clock in only makes the
 * boundary rows behave differently from the rest.
 */
export const parseReportedDate = (raw: string): number | undefined => {
  const value = raw.trim();
  if (NOT_A_DATE.has(value.toLowerCase())) return undefined;

  /* `20260729` — how the scan writes an install date. */
  const packed = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (packed)
    return dayStart(Number(packed[1]), Number(packed[2]), Number(packed[3]));

  /* `1781004400` — a Unix timestamp in seconds. A handful of installers record
     one instead of a date (Riot Vanguard is the one in this estate), and left
     unread those rows drop out of every window as if they had no date at all.
     Ten digits cannot collide with the packed form above, which is eight. */
  const epoch = /^\d{10}$/.exec(value);
  if (epoch) {
    const at = new Date(Number(value) * 1000);
    return dayStart(at.getFullYear(), at.getMonth() + 1, at.getDate());
  }

  /* `2026-08-14`, with or without a time after it. */
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(value);
  if (iso) return dayStart(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  /* `14/08/2026` — day first, as it is written where this is sold. */
  const slashed = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(value);
  if (slashed)
    return dayStart(Number(slashed[3]), Number(slashed[2]), Number(slashed[1]));

  /* `Jul 30 2026` and `30 Jul 2026`, either one possibly with a time on it. */
  const spelled =
    /^([A-Za-z]{3,})\s+(\d{1,2})[,\s]+(\d{4})/.exec(value) ??
    /^(\d{1,2})\s+([A-Za-z]{3,})[,\s]+(\d{4})/.exec(value);

  if (spelled) {
    const monthFirst = Number.isNaN(Number(spelled[1]));
    const monthName = monthFirst ? spelled[1] : spelled[2];
    const day = Number(monthFirst ? spelled[2] : spelled[1]);
    const month = MONTHS.indexOf(monthName.slice(0, 3).toLowerCase()) + 1;

    if (month > 0) return dayStart(Number(spelled[3]), month, day);
  }

  return undefined;
};

/** The window in epoch milliseconds; either edge may be open. */
export interface DateBounds {
  start?: number;
  end?: number;
}

const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** `Last 7 Days` counts today as one of the seven, the way a person would. */
const daysBack = (days: number): number => {
  const start = startOfToday();
  start.setDate(start.getDate() - (days - 1));
  return start.getTime();
};

export const dateRangeBounds = (range: DateRange): DateBounds => {
  const endOfToday = startOfToday().getTime() + 86400000 - 1;

  switch (range.preset) {
    case "Today":
      return { start: startOfToday().getTime(), end: endOfToday };
    case "Last 7 Days":
      return { start: daysBack(7), end: endOfToday };
    case "Last 30 Days":
      return { start: daysBack(30), end: endOfToday };
    case "Last 90 Days":
      return { start: daysBack(90), end: endOfToday };
    case "This Year":
      return {
        start: new Date(new Date().getFullYear(), 0, 1).getTime(),
        end: endOfToday,
      };
    case "Custom Range": {
      const start = range.from ? parseReportedDate(range.from) : undefined;
      const to = range.to ? parseReportedDate(range.to) : undefined;

      /* The "to" day is included whole — nobody means "up to midnight". */
      return { start, end: to === undefined ? undefined : to + 86400000 - 1 };
    }
    default:
      return {};
  }
};

/**
 * Whether a reported date falls in the window. A row whose date could not be
 * read — "Unknown", "Never", a machine no scan has reached — is out as soon
 * as a window is set: it cannot be shown to be inside one, and quietly
 * leaving it in would make the count wrong in the safer-looking direction.
 */
export const matchesDateRange = (raw: string, range: DateRange): boolean => {
  if (!isDateRangeActive(range)) return true;

  const at = parseReportedDate(raw);
  if (at === undefined) return false;

  const { start, end } = dateRangeBounds(range);

  if (start !== undefined && at < start) return false;
  if (end !== undefined && at > end) return false;

  return true;
};

/** How the range reads on a filter chip or a saved search. */
export const describeDateRange = (range: DateRange): string => {
  if (range.preset !== "Custom Range") return range.preset;

  const day = (value: string): string => {
    const at = parseReportedDate(value);

    return at === undefined
      ? "…"
      : new Date(at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  if (range.from && range.to) return `${day(range.from)} – ${day(range.to)}`;
  if (range.from) return `From ${day(range.from)}`;
  if (range.to) return `Until ${day(range.to)}`;

  return "Custom Range";
};
