import { filterDevices } from "./hardware";
import { filterSoftware } from "./softwareInventory";
import type { HardwareDevice, HardwareFilterState } from "@/types/hardware";
import type { SoftwareInventoryItem, SoftwareFilterState } from "@/types/software";
import type { SavedSearch, SavedSearchCategory, SearchResultDevice } from "@/types/savedSearch";
import { DEFAULT_FILTERS } from "./hardware";
import { DEFAULT_SOFTWARE_FILTERS } from "./softwareInventory";

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
    return devicesWithMatchingSoftware(devices, software, filters).map(toResultRow);
  }

  const filters = { ...DEFAULT_FILTERS, ...(state ?? {}) } as HardwareFilterState;
  return filterDevices(devices, filters).map(toResultRow);
};
