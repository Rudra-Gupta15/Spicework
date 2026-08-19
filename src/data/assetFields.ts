import type {
  AssetCustomField,
  AssetFieldEntry,
  AssetFieldSpec,
  AssetFieldValues,
  AssetLocation,
  AssetLocationDraft,
  AssetOwner,
  AssetOwnerDraft,
  AssetPurchaseInfo,
  AssetWarrantyInfo,
  LifecycleStatus,
} from "@/types/assetFields";
import type { Tone } from "@/types/ui";

import { ADMIN_SITES, CURRENT_ORGANIZATION_ID, ORGANIZATION } from "./admin";

/**
 * Mock data — swap these exports for API responses later.
 *
 * The owner and location lists are plain module-level arrays, the same way
 * the admin area holds its sites and users: a create or an edit mutates them
 * in place, so every screen that reads them on mount picks the change up
 * without a store in between.
 */

/* ── lifecycle: the one list nobody can configure ─────────────────── */

/**
 * Fixed by the product. Deliberately a `const` rather than a mutable array —
 * there is no "add status" path anywhere in the UI, and there should not be
 * one. Order runs from in-use to gone.
 */
export const LIFECYCLE_STATUSES = [
  "Active",
  "In Storage",
  "Under Repair",
  "Retired",
  "Disposed",
  "Lost/Stolen",
] as const;

/** What a newly discovered asset starts as — every other field starts blank. */
export const DEFAULT_LIFECYCLE_STATUS: LifecycleStatus = "Active";

export const LIFECYCLE_STATUS_META: Record<
  LifecycleStatus,
  { description: string; tone: Tone }
> = {
  Active: {
    description: "In service and assigned — the state a discovered asset lands in",
    tone: "success",
  },
  "In Storage": {
    description: "Held in stock, working but not issued to anybody",
    tone: "info",
  },
  "Under Repair": {
    description: "Out of service with the workshop or the vendor",
    tone: "warning",
  },
  Retired: {
    description: "Withdrawn from service, still owned and still tracked",
    tone: "neutral",
  },
  Disposed: {
    description: "Sold, recycled or written off — kept only for the audit trail",
    tone: "neutral",
  },
  "Lost/Stolen": {
    description: "Unaccounted for; the record stays open for investigation",
    tone: "danger",
  },
};

/* ── scope ─────────────────────────────────────────────────────────── */

/** The picker label for an entry every organization can use. */
export const GLOBAL_SCOPE_LABEL = "Global — all organizations";

/** Extra option on the filter bars; never a value an entry can be saved with. */
export const ALL_SCOPES_LABEL = "All Scopes";

/**
 * Global first, then the organizations an entry can be restricted to. This
 * install carries one organization, so the list is short — it grows on its
 * own once `data/admin` holds more than one.
 */
export const scopeOptions = (): string[] => [GLOBAL_SCOPE_LABEL, ORGANIZATION.name];

export const scopeFilterOptions = (): string[] => [
  ALL_SCOPES_LABEL,
  ...scopeOptions(),
];

/** How an entry's scope reads in a table cell or a picker. */
export const scopeLabel = (entry: AssetFieldEntry): string =>
  entry.scope === "Global"
    ? GLOBAL_SCOPE_LABEL
    : (entry.organizationName ?? ORGANIZATION.name);

/** Turns the label a picker returns back into the fields an entry stores. */
export const resolveScope = (
  label: string,
): Pick<AssetFieldEntry, "scope" | "organizationId" | "organizationName"> =>
  label === GLOBAL_SCOPE_LABEL
    ? { scope: "Global", organizationId: undefined, organizationName: undefined }
    : {
        scope: "Organization",
        organizationId: ORGANIZATION.id,
        organizationName: ORGANIZATION.name,
      };

/* ── owners ────────────────────────────────────────────────────────── */

/** Restricted to the signed-in organization — the common case. */
const OWNED_BY_ORG = {
  scope: "Organization",
  organizationId: CURRENT_ORGANIZATION_ID,
  organizationName: ORGANIZATION.name,
} as const;

/**
 * Seeded from the people already named as site contacts, so the directory
 * agrees with the Sites screen instead of inventing a second set of names.
 */
const siteContact = (index: number) => ({
  name: ADMIN_SITES[index]?.contactName ?? "",
  email: ADMIN_SITES[index]?.contactEmail ?? "",
});

export const ASSET_OWNERS: AssetOwner[] = [
  /* The two central roles look after kit wherever it sits. */
  { id: "owner-1", ...siteContact(0), scope: "Global" },
  { id: "owner-2", ...siteContact(1), scope: "Global" },
  { id: "owner-3", ...siteContact(2), ...OWNED_BY_ORG },
  { id: "owner-4", ...siteContact(3), ...OWNED_BY_ORG },
  { id: "owner-5", ...siteContact(4), ...OWNED_BY_ORG },
];

/* ── locations ─────────────────────────────────────────────────────── */

export const ASSET_LOCATIONS: AssetLocation[] = [
  {
    id: "location-1",
    name: "Remote / Work From Home",
    description: "Issued to a person rather than a desk",
    scope: "Global",
  },
  {
    id: "location-2",
    name: "Central Store",
    description: "Spares and unissued stock",
    scope: "Global",
  },
  {
    id: "location-3",
    name: "HQ Mumbai — 3rd Floor",
    description: "Bandra Kurla Complex, open floor",
    ...OWNED_BY_ORG,
  },
  {
    id: "location-4",
    name: "HQ Mumbai — Server Room",
    description: "Racked equipment, badge access only",
    ...OWNED_BY_ORG,
  },
  {
    id: "location-5",
    name: "Pune — Lab A",
    description: "Hinjewadi Phase II, test bench",
    ...OWNED_BY_ORG,
  },
  {
    id: "location-6",
    name: "Hyderabad — Desk Pool",
    description: "HITEC City, hot desks",
    ...OWNED_BY_ORG,
  },
];

/* ── custom fields ─────────────────────────────────────────────────── */

/**
 * What this organization tracks on an asset beyond the fields the product
 * ships with. Seeded with the three that come up on every estate; the list
 * is a plain array like the two above, so it grows the same way.
 */
export const ASSET_CUSTOM_FIELDS: AssetCustomField[] = [
  {
    id: "custom-asset-tag",
    label: "Asset Tag",
    type: "text",
    description: "The sticker on the case — the number an audit counts by",
    scope: "Global",
  },
  {
    id: "custom-cost-centre",
    label: "Cost Centre",
    type: "text",
    description: "Which budget the asset is charged to",
    ...OWNED_BY_ORG,
  },
  {
    id: "custom-department",
    label: "Department",
    type: "select",
    options: ["IT", "Finance", "Operations", "Sales", "Support", "Engineering"],
    description: "The team the asset sits with, whoever holds it",
    ...OWNED_BY_ORG,
  },
];

/* ── writes ────────────────────────────────────────────────────────── */

/** Next free number in an `owner-3` / `location-7` style id. */
const nextId = (prefix: string, entries: AssetFieldEntry[]): string => {
  const highest = entries.reduce((max, entry) => {
    const number = Number(entry.id.replace(`${prefix}-`, ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `${prefix}-${highest + 1}`;
};

export const addOwner = (draft: AssetOwnerDraft): AssetOwner => {
  const owner: AssetOwner = { ...draft, id: nextId("owner", ASSET_OWNERS) };
  ASSET_OWNERS.unshift(owner);
  return owner;
};

export const updateOwner = (
  id: string,
  draft: AssetOwnerDraft,
): AssetOwner | undefined => {
  const owner = ASSET_OWNERS.find((entry) => entry.id === id);
  if (!owner) return undefined;

  Object.assign(owner, draft);
  return owner;
};

/**
 * Removing an entry only takes it out of the picker. Assets already pointing
 * at it keep the id they were given — the backend decides whether to blank
 * them or leave the historic value in place, and a mock cannot.
 */
export const removeOwner = (id: string): void => {
  const index = ASSET_OWNERS.findIndex((entry) => entry.id === id);
  if (index >= 0) ASSET_OWNERS.splice(index, 1);
};

export const addLocation = (draft: AssetLocationDraft): AssetLocation => {
  const location: AssetLocation = {
    ...draft,
    id: nextId("location", ASSET_LOCATIONS),
  };
  ASSET_LOCATIONS.unshift(location);
  return location;
};

export const updateLocation = (
  id: string,
  draft: AssetLocationDraft,
): AssetLocation | undefined => {
  const location = ASSET_LOCATIONS.find((entry) => entry.id === id);
  if (!location) return undefined;

  Object.assign(location, draft);
  return location;
};

export const removeLocation = (id: string): void => {
  const index = ASSET_LOCATIONS.findIndex((entry) => entry.id === id);
  if (index >= 0) ASSET_LOCATIONS.splice(index, 1);
};

/* ── what the asset form reads ─────────────────────────────────────── */

/** Blank is a real choice: a discovered asset has nobody on it yet. */
export const UNASSIGNED_OWNER_LABEL = "— Unassigned —";

export const NO_LOCATION_LABEL = "— No location —";

/** Global entries plus the ones restricted to this organization. */
const inScope = <T extends AssetFieldEntry>(
  entries: T[],
  organizationId: string,
): T[] =>
  entries.filter(
    (entry) =>
      entry.scope === "Global" || entry.organizationId === organizationId,
  );

export const ownersInScope = (
  organizationId: string = CURRENT_ORGANIZATION_ID,
): AssetOwner[] => inScope(ASSET_OWNERS, organizationId);

export const locationsInScope = (
  organizationId: string = CURRENT_ORGANIZATION_ID,
): AssetLocation[] => inScope(ASSET_LOCATIONS, organizationId);

export const customFieldsInScope = (
  organizationId: string = CURRENT_ORGANIZATION_ID,
): AssetCustomField[] => inScope(ASSET_CUSTOM_FIELDS, organizationId);

/**
 * A file names an owner or a location the way a person would, so the name is
 * what has to be matched back to the entry — case and spacing forgiven,
 * because a spreadsheet is typed by hand.
 */
const byName = <T extends AssetFieldEntry & { name: string }>(
  entries: T[],
  name: string,
): T | undefined => {
  const wanted = name.trim().toLowerCase();
  return entries.find((entry) => entry.name.trim().toLowerCase() === wanted);
};

export const findOwnerByName = (name: string): AssetOwner | undefined =>
  byName(ownersInScope(), name);

export const findLocationByName = (name: string): AssetLocation | undefined =>
  byName(locationsInScope(), name);

/** Owner dropdown for an asset form — blank first, then who is available. */
export const ownerPickerOptions = (
  organizationId?: string,
): string[] => [
  UNASSIGNED_OWNER_LABEL,
  ...ownersInScope(organizationId).map((owner) => owner.name),
];

export const locationPickerOptions = (
  organizationId?: string,
): string[] => [
  NO_LOCATION_LABEL,
  ...locationsInScope(organizationId).map((location) => location.name),
];

/* ── purchase & warranty ───────────────────────────────────────────── */

/**
 * Purchase Price is "numeric with currency", and the currency has to come
 * from somewhere — this is what a new price field is denominated in until
 * the person entering it says otherwise.
 */
export const CURRENCY_OPTIONS = [
  "INR (₹)",
  "USD ($)",
  "EUR (€)",
  "GBP (£)",
  "AED (د.إ)",
] as const;

/** Mutated in place by the settings panel, like every other mock default. */
export const ASSET_FIELD_DEFAULTS = {
  currency: CURRENCY_OPTIONS[0] as string,
};

export const setDefaultCurrency = (currency: string): void => {
  ASSET_FIELD_DEFAULTS.currency = currency;
};

const blankPurchase = (): AssetPurchaseInfo => ({
  purchaseDate: "",
  purchasePrice: "",
  currency: ASSET_FIELD_DEFAULTS.currency,
  poNumber: "",
  vendor: "",
});

const blankWarranty = (): AssetWarrantyInfo => ({
  provider: "",
  startDate: "",
  endDate: "",
  notes: "",
});

/**
 * What an asset holds the first time the agent reports it: no owner, no
 * location, no paperwork, and Active — the only field with a starting value.
 */
export const blankAssetFields = (): AssetFieldValues => ({
  ownerId: "",
  locationId: "",
  lifecycleStatus: DEFAULT_LIFECYCLE_STATUS,
  purchase: blankPurchase(),
  warranty: blankWarranty(),
  custom: {},
});

/** Rows for the read-only reference tables on the settings screen. */
export const PURCHASE_FIELD_SPECS: AssetFieldSpec[] = [
  { id: "purchase-date", label: "Purchase Date", control: "Date picker", firstDiscovery: "Blank" },
  { id: "purchase-price", label: "Purchase Price", control: "Numeric + currency", firstDiscovery: "Blank" },
  { id: "purchase-po", label: "Purchase Order (PO) Number", control: "Alphanumeric text", firstDiscovery: "Blank" },
  { id: "purchase-vendor", label: "Vendor / Reseller", control: "Text", firstDiscovery: "Blank" },
];

export const WARRANTY_FIELD_SPECS: AssetFieldSpec[] = [
  { id: "warranty-provider", label: "Warranty Provider", control: "Text", firstDiscovery: "Blank" },
  { id: "warranty-start", label: "Warranty Start Date", control: "Date picker", firstDiscovery: "Blank" },
  { id: "warranty-end", label: "Warranty End Date", control: "Date picker", firstDiscovery: "Blank" },
  { id: "warranty-notes", label: "Warranty Notes", control: "Multi-line text", firstDiscovery: "Blank" },
];
