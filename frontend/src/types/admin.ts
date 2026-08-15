/**
 * The admin area manages one organization — the tenant the signed-in user
 * belongs to. There is no account or organization picker anywhere, so sites
 * and users carry no parent id: they belong to that one organization by
 * definition.
 */

/** Lifecycle state shared by every admin record. */
export type AdminStatus = "Active" | "Trial" | "Suspended" | "Invited";

/** What the organization uses a location for. */
export type AdminSiteType =
  | "Head Office"
  | "Branch Office"
  | "Data Centre"
  | "Warehouse"
  | "Remote / Home";

/** The organization being administered. */
export interface AdminOrganization {
  id: string;
  name: string;
  industry: string;
  status: AdminStatus;
  createdOn: string;
  /** Derived from the sites and users below it. */
  sites: number;
  users: number;
  devices: number;
}

/** A physical location the organization operates from. */
export interface AdminSite {
  id: string;
  name: string;
  siteType: AdminSiteType;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  /** `city, state, country` — the single column the lists show. */
  location: string;
  timezone: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  /** The organization's registered address — at most one site holds it. */
  isPrimary: boolean;
  status: AdminStatus;
  /** Derived from the users stationed at this site. */
  users: number;
  devices: number;
}

/**
 * A city the organization has at least one site in. Never stored — it is
 * whatever the current sites add up to, so opening an office in a new city
 * puts it on the list without anything else being created.
 */
export interface AdminCity {
  /** Slug of the city name; what the sites list filters on. */
  id: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  sites: number;
  users: number;
  devices: number;
  /** The sites in this city, for the secondary line in the list. */
  siteNames: string[];
}

/** A person with portal access, stationed at one of the sites. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  siteId: string;
  siteName: string;
  status: AdminStatus;
  lastLogin: string;
}

/** What the organization profile form collects. */
export type AdminOrganizationDraft = Pick<
  AdminOrganization,
  "name" | "industry" | "status"
>;

/**
 * What the site form collects. `location` and the counts are derived, so the
 * form never sets them directly.
 */
export type AdminSiteDraft = Pick<
  AdminSite,
  | "name"
  | "siteType"
  | "addressLine"
  | "city"
  | "state"
  | "country"
  | "postalCode"
  | "timezone"
  | "contactName"
  | "contactEmail"
  | "contactPhone"
  | "isPrimary"
  | "status"
>;
