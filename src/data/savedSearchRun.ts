import { filterDevices } from "./hardware";
import { filterSoftware } from "./softwareInventory";
import type { HardwareDevice, HardwareFilterState } from "@/types/hardware";
import type { SoftwareInventoryItem, SoftwareFilterState } from "@/types/software";
import type { SavedSearch, SavedSearchCategory, SearchResultDevice } from "@/types/savedSearch";
import { DEFAULT_FILTERS } from "./hardware";
import { DEFAULT_SOFTWARE_FILTERS } from "./softwareInventory";
import { byNewestReported, describeDateRange, isDateRangeActive, singleDayRange } from "@/lib/dateRange";

/**
 * Re-runs a saved search against the estate as it stands now.
 *
 * A saved search stores the filter bar's own state, not its results, so what
 * comes back here is current rather than a snapshot of the day it was saved —
 * the point of saving a query is to ask it again.
 *
 * Both categories answer with devices. A software query is about applications,
 * but the useful answer to "show me this saved search" is which machines it
 * concerns, and one row shape keeps the results table honest about what each
 * line represents.
 */

const toResultRow = (device: HardwareDevice): SearchResultDevice => ({
  id: device.id,
  name: device.name,
  status: device.status === "ONLINE" ? "ONLINE" : "OFFLINE",
  type: device.type,
  manufacturer: device.manufacturer,
  serial: device.serialNumber,
  lastScan: device.lastScan,
  scanDays: device.scanDays,
});

/** Devices carrying at least one application the software query matches. */
const devicesWithMatchingSoftware = (
  devices: HardwareDevice[],
  software: SoftwareInventoryItem[],
  filters: SoftwareFilterState,
): HardwareDevice[] => {
  const matched = filterSoftware(software, filters);
  const names = new Set<string>();

  matched.forEach((item) =>
    item.devices.forEach((entry) => {
      names.add(entry.id.trim().toLowerCase());
      names.add(entry.name.trim().toLowerCase());
    }),
  );

  return devices.filter(
    (device) =>
      names.has(device.id.trim().toLowerCase()) ||
      names.has(device.name.trim().toLowerCase()),
  );
};

/**
 * One row per machine, carrying its most recent scan.
 *
 * The devices endpoint keys on (name, OS family), so a dual-booted box comes
 * back twice — same machine, same serial, two rows differing only by when each
 * side last reported. Two lines nobody can tell apart is worse than one, so the
 * repeats collapse and the trail behind them moves into the scan history.
 *
 * Keyed on the computer name alone: it is what the audit is filed under, and
 * what the scan-history endpoint looks a device up by.
 */
const collapseByDevice = (rows: SearchResultDevice[]): SearchResultDevice[] => {
  const newest = new Map<string, SearchResultDevice>();
  const daysByKey = new Map<string, Set<string>>();

  rows.forEach((row) => {
    const key = row.name.trim().toLowerCase();
    const held = newest.get(key);
    /* String compare is safe here: lastScan is `YYYY-MM-DD HH:MM:SS`, which
       sorts chronologically as text. */
    if (!held || row.lastScan > held.lastScan) newest.set(key, row);

    /* Unioned across every side of the machine: a dual-booted box files a
       Windows row and a Linux row under the same key, and a day either side
       was scanned on is a day this computer was scanned on. */
    const days = daysByKey.get(key) ?? new Set<string>();
    row.scanDays.forEach((day) => days.add(day));
    daysByKey.set(key, days);
  });

  const collapsed = [...newest.entries()].map(([key, row]) => ({
    ...row,
    scanDays: [...(daysByKey.get(key) ?? [])].sort().reverse(),
  }));

  /* Sorted on the parsed day rather than the string: a device no scan has
     reached reads "Unknown", and `U` compares above every digit, so a plain
     text sort floated exactly the least informative rows to the top. */
  return collapsed.sort(byNewestReported((row) => row.lastScan));
};

/**
 * The query a hardware save runs, and whether the date window in it was
 * derived rather than chosen.
 */
export interface HardwareSavedQuery {
  filters: HardwareFilterState;
  /** Chip describing a derived window — absent when the save chose its own. */
  pinnedChip?: string;
}

/**
 * A hardware save that recorded no filters at all runs pinned to the day it
 * was made.
 *
 * That save is the one auto-named "All Hardware — <the day it was made>",
 * because an empty filter bar leaves nothing else to name it after — so the
 * title is a question about that specific day, and each save answers only for
 * its own day rather than being pooled with every other unfiltered save into
 * one "whole estate" figure.
 *
 * The condition is "recorded no filters", not "recorded no date window". A
 * save named "Type: Laptop" is a question about laptops, and pinning it to a
 * day would silently answer a question nobody asked.
 *
 * A day with nothing scanned on it is an honest zero, not a bug: `last_seen`
 * holds only the *latest* scan, so a machine rescanned after the save date
 * moves off that day for good. `singleDayRange`/`describeDateRange` resolve
 * the day itself; `hardwareFilterOptions` in `./hardware` is the separate,
 * unrelated feature that lists every scan day for the *live* filter bar to
 * pick from — this is about what one already-saved search replays.
 */
export const hardwareSavedQuery = (search: SavedSearch): HardwareSavedQuery => {
  const stored = {
    ...DEFAULT_FILTERS,
    ...(search.filterState ?? {}),
  } as HardwareFilterState;

  const chips = search.appliedFilters ?? [];
  if (chips.length > 0 || isDateRangeActive(stored.lastScan))
    return { filters: stored };

  const day = singleDayRange(search.createdAt);
  if (!day) return { filters: stored };

  return {
    filters: { ...stored, lastScan: day },
    pinnedChip: `Last Scan: ${describeDateRange(day)}`,
  };
};

/**
 * The Filters column as the search actually runs — the derived day included,
 * so the list cannot describe a pinned search as unfiltered while its own
 * page shows it narrowed to one day.
 */
export const savedSearchFiltersLabel = (
  category: SavedSearchCategory,
  search: SavedSearch,
): string =>
  (category === "Hardware" ? hardwareSavedQuery(search).pinnedChip : undefined) ??
  search.filters;

export const runSavedSearch = (
  category: SavedSearchCategory,
  search: SavedSearch | null,
  devices: HardwareDevice[],
  software: SoftwareInventoryItem[],
): SearchResultDevice[] => {
  if (!search) return [];

  /* Searches saved before the bar's state was stored have nothing to replay.
     They were all saved unfiltered, so the whole estate is the right answer —
     and it is the answer they would give if re-run today. */
  const state = search.filterState;

  if (category === "Software") {
    const filters = { ...DEFAULT_SOFTWARE_FILTERS, ...(state ?? {}) } as SoftwareFilterState;
    return collapseByDevice(
      devicesWithMatchingSoftware(devices, software, filters).map(toResultRow),
    );
  }

  if (category === "Hardware")
    return collapseByDevice(
      filterDevices(devices, hardwareSavedQuery(search).filters).map(toResultRow),
    );

  /* Cloud Assets and Network have no filter bar of their own yet, so a save in
     either answers with the estate the way an unfiltered hardware save used
     to. They are not date-named, so nothing here is pinned to a day. */
  const filters = { ...DEFAULT_FILTERS, ...(state ?? {}) } as HardwareFilterState;
  return collapseByDevice(filterDevices(devices, filters).map(toResultRow));
};
