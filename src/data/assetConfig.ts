import { useSyncExternalStore } from "react";

import { ADMIN_SITES } from "./admin";

/**
 * Frontend-only configuration for the Owner and Location dropdowns used when
 * assigning them to an asset. Persisted to localStorage and shared live across
 * the Settings screens (where the lists are edited) and the asset Lifecycle
 * form (where they're picked). Swap this store for real API calls later — the
 * hooks/mutators are the seam.
 */

export const GLOBAL_SCOPE = "Global";

/** "Global", or the name of a specific organization/site the entry is limited to. */
export type Scope = string;

export interface OwnerOption {
  id: string;
  name: string;
  email: string;
  scope: Scope;
}

export interface LocationOption {
  id: string;
  name: string;
  scope: Scope;
}

/** Fixed, non-configurable lifecycle statuses (per the spec). */
export const LIFECYCLE_STATUSES = [
  "Active",
  "In Storage",
  "Under Repair",
  "Retired",
  "Disposed",
  "Lost/Stolen",
] as const;

export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];

/** What a freshly discovered asset gets before anyone edits it. */
export const DEFAULT_LIFECYCLE_STATUS: LifecycleStatus = "Active";

/** Scope choices: Global, plus each organization/site to restrict an entry to. */
export const SCOPE_OPTIONS: string[] = [
  GLOBAL_SCOPE,
  ...ADMIN_SITES.map((site) => site.name),
];

/* ── Seeded defaults ─────────────────────────────────────────────────────── */

const SEED_OWNERS: OwnerOption[] = [
  { id: "own-1", name: "Alex Rivera", email: "alex.rivera@prevoyancesolutions.com", scope: GLOBAL_SCOPE },
  { id: "own-2", name: "Priya Sharma", email: "priya.sharma@prevoyancesolutions.com", scope: GLOBAL_SCOPE },
  { id: "own-3", name: "Network Team", email: "netops@prevoyancesolutions.com", scope: GLOBAL_SCOPE },
];

const SEED_LOCATIONS: LocationOption[] = [
  { id: "loc-1", name: "Head Office — Server Room", scope: GLOBAL_SCOPE },
  { id: "loc-2", name: "Reception Desk", scope: GLOBAL_SCOPE },
  { id: "loc-3", name: "Remote / Work From Home", scope: GLOBAL_SCOPE },
];

/* ── localStorage-backed reactive store ──────────────────────────────────── */

const OWNERS_KEY = "assetConfig.owners";
const LOCATIONS_KEY = "assetConfig.locations";

const load = <T,>(key: string, fallback: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
};

const persist = <T,>(key: string, value: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — the in-memory copy still works for this session. */
  }
};

let owners: OwnerOption[] = load(OWNERS_KEY, SEED_OWNERS);
let locations: LocationOption[] = load(LOCATIONS_KEY, SEED_LOCATIONS);

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const newId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/* ── Owners ──────────────────────────────────────────────────────────────── */

export const useOwners = (): OwnerOption[] =>
  useSyncExternalStore(subscribe, () => owners);

export const addOwner = (owner: Omit<OwnerOption, "id">): void => {
  owners = [...owners, { ...owner, id: newId("own") }];
  persist(OWNERS_KEY, owners);
  emit();
};

export const updateOwner = (id: string, patch: Partial<Omit<OwnerOption, "id">>): void => {
  owners = owners.map((owner) => (owner.id === id ? { ...owner, ...patch } : owner));
  persist(OWNERS_KEY, owners);
  emit();
};

export const removeOwner = (id: string): void => {
  owners = owners.filter((owner) => owner.id !== id);
  persist(OWNERS_KEY, owners);
  emit();
};

/* ── Locations ───────────────────────────────────────────────────────────── */

export const useLocations = (): LocationOption[] =>
  useSyncExternalStore(subscribe, () => locations);

export const addLocation = (location: Omit<LocationOption, "id">): void => {
  locations = [...locations, { ...location, id: newId("loc") }];
  persist(LOCATIONS_KEY, locations);
  emit();
};

export const updateLocation = (id: string, patch: Partial<Omit<LocationOption, "id">>): void => {
  locations = locations.map((location) => (location.id === id ? { ...location, ...patch } : location));
  persist(LOCATIONS_KEY, locations);
  emit();
};

export const removeLocation = (id: string): void => {
  locations = locations.filter((location) => location.id !== id);
  persist(LOCATIONS_KEY, locations);
  emit();
};
