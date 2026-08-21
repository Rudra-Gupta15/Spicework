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

/**
 * One exact day picked from the dates the rows actually carry.
 *
 * Deliberately not a member of `DATE_RANGE_PRESETS`: the picker lists the days
 * it finds in the data, which change as scans arrive, so they cannot be a fixed
 * list. Keeping it out of the Custom Range case too means picking "19 Aug" and
 * then opening Custom Range are distinguishable — overloading one on the other
 * made the two-field editor vanish the moment someone typed matching dates.
 */
export const ON_DATE = "On Date";

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number] | typeof ON_DATE;

/**
 * A chosen window. `from`/`to` are `yyyy-mm-dd`; Custom Range uses both, and
 * `On Date` puts the single chosen day in both.
 */
export interface DateRange {
  preset: DateRangePreset;
  from: string;
  to: string;
}

/** The window covering exactly `day` (a `yyyy-mm-dd` string). */
export const onDate = (day: string): DateRange => ({
  preset: ON_DATE,
  from: day,
  to: day,
});

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

const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** How long each unit a relative time can be written in lasts, in days. */
const UNIT_DAYS: Record<string, number> = {
  sec: 0,
  min: 0,
  hour: 0,
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

/**
 * "3 days ago", "15 mins ago", "just now" — how a scan time is written once
 * it is recent enough for a clock reading to be less useful than a rough
 * one. Anything under a day lands on today, which is the day it happened.
 */
const parseRelative = (value: string): number | undefined => {
  const lower = value.toLowerCase();

  if (lower === "just now" || lower === "today") return startOfToday().getTime();

  if (lower === "yesterday") {
    const day = startOfToday();
    day.setDate(day.getDate() - 1);
    return day.getTime();
  }

  const relative = /^(?:about\s+)?(\d+)\s+([a-z]+?)s?\s+ago$/.exec(lower);
  if (!relative) return undefined;

  const unit = relative[2].replace(/^mins?$/, "min").replace(/^secs?$/, "sec");
  const days = UNIT_DAYS[unit];
  if (days === undefined) return undefined;

  const day = startOfToday();
  day.setDate(day.getDate() - days * Number(relative[1]));

  return day.getTime();
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

  const relative = parseRelative(value);
  if (relative !== undefined) return relative;

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
    case ON_DATE: {
      const day = parseReportedDate(range.from);

      return day === undefined
        ? {}
        : { start: day, end: day + 86400000 - 1 };
    }
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
  if (range.preset === ON_DATE) return formatReportedDate(range.from);
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

  /* A window whose two ends are the same day is one day, and saying it twice
     reads like a mistake — "19 Aug 2026 – 19 Aug 2026". */
  if (range.from && range.to)
    return range.from === range.to
      ? day(range.from)
      : `${day(range.from)} – ${day(range.to)}`;
  if (range.from) return `From ${day(range.from)}`;
  if (range.to) return `Until ${day(range.to)}`;

  return "Custom Range";
};

/**
 * A reported date written the way the rest of the app writes dates —
 * `Aug 19, 2026`. The clock reading is dropped on purpose: a Last Scan
 * column is read for how stale a row is, and a stack of
 * `2026-07-29 13:46:36` is far harder to scan than a stack of days.
 * A value that carries no date ("Unknown", "Never") is passed through as it
 * stands, because that is what the row honestly says.
 */
export const formatReportedDate = (raw: string): string => {
  const at = parseReportedDate(raw);
  if (at === undefined) return raw.trim() || "—";

  return new Date(at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Comparator putting the most recently dated row first, and rows whose date
 * could not be read last. Undated rows sink rather than float: "Unknown" is
 * the absence of a scan, not a very old one, and sorting it to the top would
 * fill page one with the least informative rows in the estate.
 *
 * Sorting is on the parsed day, not the string, so the mixed formats these
 * lists carry (`2026-07-29 13:46:36` beside `Jul 30 2026`) still order
 * against each other correctly.
 */
export const byNewestReported =
  <T,>(getDate: (row: T) => string) =>
  (a: T, b: T): number => {
    const left = parseReportedDate(getDate(a));
    const right = parseReportedDate(getDate(b));

    if (left === undefined) return right === undefined ? 0 : 1;
    if (right === undefined) return -1;

    return right - left;
  };

/** `yyyy-mm-dd` of a local date — the shape the custom-range fields hold. */
const isoDay = (at: Date): string =>
  [
    at.getFullYear(),
    String(at.getMonth() + 1).padStart(2, "0"),
    String(at.getDate()).padStart(2, "0"),
  ].join("-");

/**
 * The one-day window around `value` — a Custom Range whose two ends are the
 * same day, which `dateRangeBounds` already reads as that whole day rather
 * than the instant of midnight.
 *
 * A value carrying a clock reading is read as a real instant, so a timestamp
 * written in UTC lands on the day it happened *here*; a bare `2026-08-19` is
 * left to `parseReportedDate`, because `Date.parse` would call that UTC
 * midnight and hand back the day before to anyone west of Greenwich.
 *
 * Undefined when there is no date in the value to build a window from.
 */
export const singleDayRange = (value: string): DateRange | undefined => {
  const hasClock = /\d{1,2}:\d{2}/.test(value);
  const parsed = hasClock ? Date.parse(value) : Number.NaN;

  const at = Number.isNaN(parsed) ? parseReportedDate(value) : parsed;
  if (at === undefined) return undefined;

  const day = isoDay(new Date(at));

  return { preset: "Custom Range", from: day, to: day };
};

/**
 * The distinct days a column of reported dates falls on, newest first, as
 * `yyyy-mm-dd`.
 *
 * This is what lets the picker offer the dates the estate actually holds
 * rather than a fixed list: it is derived from the rows on every render, so a
 * scan landing on a day nothing had been scanned on before puts that day in
 * the menu with no further work, and a day whose last machine was rescanned
 * drops out of it.
 *
 * Values carrying no readable date contribute nothing — there is no day to
 * offer for a machine no scan has reached.
 */
export const reportedDays = (values: string[]): string[] => {
  const days = new Set<string>();

  values.forEach((value) => {
    const at = parseReportedDate(value);
    if (at !== undefined) days.add(isoDay(new Date(at)));
  });

  /* `yyyy-mm-dd` sorts chronologically as text, so newest first is the plain
     descending sort — and it is the order a person scanning the menu wants,
     since the recent days are the ones being asked about. */
  return [...days].sort().reverse();
};

/**
 * Whether ANY of a device's scanned days falls in the window — the history
 * version of `matchesDateRange`.
 *
 * `lastScan` is a single snapshot: the most recent scan, and nothing before
 * it. A device rescanned since a given day drops off that day the moment
 * `matchesDateRange` is asked, even though the day genuinely happened. This
 * instead asks the device's whole `scanDays` list, so "Last Scan: 17 Aug
 * 2026" keeps finding a machine that was scanned on the 17th and has since
 * been rescanned — the same honesty rule applies to the empty case: a device
 * with no day on record is out as soon as a window is set.
 */
export const matchesDateRangeAny = (days: string[], range: DateRange): boolean => {
  if (!isDateRangeActive(range)) return true;
  if (days.length === 0) return false;

  const { start, end } = dateRangeBounds(range);

  return days.some((raw) => {
    const at = parseReportedDate(raw);
    if (at === undefined) return false;
    if (start !== undefined && at < start) return false;
    if (end !== undefined && at > end) return false;
    return true;
  });
};
