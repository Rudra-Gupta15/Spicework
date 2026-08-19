/**
 * The fields an IT pro fills in by hand on an asset, as opposed to the ones
 * the agent discovers for itself.
 *
 * Two of them — Owner and Location — are picked from lists the organization
 * configures under Settings → Asset Fields. Lifecycle Status is picked from a
 * fixed list that nobody can edit. Purchase and Warranty are plain entry
 * fields with no list behind them.
 */

/** Whether a configured entry is offered everywhere or to one organization. */
export type AssetFieldScope = "Global" | "Organization";

/** What every configurable list entry carries, whatever kind it is. */
export interface AssetFieldEntry {
  id: string;
  scope: AssetFieldScope;
  /** Set only while `scope` is "Organization". */
  organizationId?: string;
  organizationName?: string;
}

/** Somebody an asset can be made the responsibility of. */
export interface AssetOwner extends AssetFieldEntry {
  name: string;
  email: string;
}

/** Somewhere an asset can physically sit. */
export interface AssetLocation extends AssetFieldEntry {
  name: string;
  /** Optional building/floor/room detail shown under the name. */
  description: string;
}

/**
 * A column the organization added for itself — an asset tag scheme, a cost
 * centre, whatever this estate tracks that the product does not ship with.
 * It carries a type so a bulk upload can hold a file to it the same way it
 * holds one to a purchase date.
 */
export type AssetCustomFieldType = "text" | "number" | "date" | "select";

export interface AssetCustomField extends AssetFieldEntry {
  label: string;
  type: AssetCustomFieldType;
  /** The values allowed — `select` only. */
  options?: string[];
  /** Fine print under the control on the asset form. */
  description: string;
}

/** What the owner dialog collects — the id is assigned on save. */
export type AssetOwnerDraft = Omit<AssetOwner, "id">;

export type AssetLocationDraft = Omit<AssetLocation, "id">;

export type AssetCustomFieldDraft = Omit<AssetCustomField, "id">;

/**
 * Fixed by the product, not by the organization — the settings screen shows
 * these read-only. Transitions between them are free-form: any status can
 * move to any other one.
 */
export type LifecycleStatus =
  | "Active"
  | "In Storage"
  | "Under Repair"
  | "Retired"
  | "Disposed"
  | "Lost/Stolen";

/** Procurement details, all blank until somebody records them. */
export interface AssetPurchaseInfo {
  /** ISO `yyyy-mm-dd`, or "" when not recorded. */
  purchaseDate: string;
  /** Kept as the string the field holds so "" stays distinct from 0. */
  purchasePrice: string;
  currency: string;
  poNumber: string;
  vendor: string;
}

/** Coverage details, all blank until somebody records them. */
export interface AssetWarrantyInfo {
  provider: string;
  startDate: string;
  endDate: string;
  notes: string;
}

/** Everything on an asset that a person sets rather than the agent. */
export interface AssetFieldValues {
  /** "" — a freshly discovered asset has no owner until one is assigned. */
  ownerId: string;
  /** "" — likewise for where it sits. */
  locationId: string;
  lifecycleStatus: LifecycleStatus;
  purchase: AssetPurchaseInfo;
  warranty: AssetWarrantyInfo;
  /** The organization's own columns, keyed by custom field id. */
  custom: Record<string, string>;
}

/** One row of the read-only "what this field is" reference table. */
export interface AssetFieldSpec {
  id: string;
  label: string;
  /** The control the asset form puts in front of the user. */
  control: string;
  /** What the field holds the moment an asset is first discovered. */
  firstDiscovery: string;
}
