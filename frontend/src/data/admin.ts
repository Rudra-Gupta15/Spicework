import type {
  AdminCity,
  AdminOrganization,
  AdminOrganizationDraft,
  AdminSite,
  AdminSiteDraft,
  AdminSiteType,
  AdminStatus,
  AdminUser,
} from "@/types/admin";

/**
 * Mock data — swap these exports for API responses later.
 *
 * The admin area covers one organization, so there is exactly one of it here
 * and everything else hangs off it: Organization → Site → Users. Every count
 * is derived from the set below it — a site's user count comes from the
 * people stationed there, the organization's counts come from its sites — so
 * a dashboard tile can never disagree with the list it opens.
 */

export const TOTAL_USERS = 342;

/** The organization this install belongs to. Swap for the tenant from auth. */
export const CURRENT_ORGANIZATION_ID = "org-prevoyance";

const INDUSTRIES = [
  "Information Technology",
  "Financial Services",
  "Education",
  "Healthcare",
  "Logistics",
  "Retail",
  "Manufacturing",
  "Hospitality",
] as const;

const OWNERS = [
  "Jane Doe",
  "Rahul Verma",
  "Aisha Khan",
  "Michael Brooks",
  "Priya Sharma",
  "Daniel Osei",
  "Sofia Marino",
  "Rohit Mehta",
] as const;

const FIRST_NAMES = [
  "Aarav", "Neha", "Vikram", "Emily", "Arjun", "Sara", "Karan", "Olivia",
  "Ishaan", "Grace", "Rohan", "Maya", "Aditya", "Chloe", "Nikhil", "Zara",
  "Kabir", "Riya", "Dev", "Hannah",
] as const;

const LAST_NAMES = [
  "Sharma", "Patel", "Nair", "Watson", "Iyer", "Fernandes", "Kulkarni", "Bennett",
  "Chopra", "Reddy", "Dsouza", "Whitfield", "Malhotra", "Banerjee", "Joshi", "Carter",
  "Ahuja", "Mehra", "Sinha", "Grant",
] as const;

const ROLES = [
  "IT Manager",
  "Technician",
  "Help Desk Agent",
  "Auditor",
  "Viewer",
] as const;

/**
 * Status is spread deterministically rather than randomly — the same index
 * always yields the same record, so a deep link never points at a row that
 * has quietly changed underneath it.
 */
const statusFor = (index: number): AdminStatus => {
  if (index % 17 === 5) return "Suspended";
  if (index % 11 === 3) return "Trial";
  if (index % 7 === 2) return "Invited";
  return "Active";
};

/** Recent sign-in days, all on or before the current mock "today". */
const LOGIN_DAYS = [
  "2 Jun 2026",
  "11 Jun 2026",
  "23 Jun 2026",
  "4 Jul 2026",
  "15 Jul 2026",
  "26 Jul 2026",
  "30 Jul 2026",
  "3 Aug 2026",
  "8 Aug 2026",
  "12 Aug 2026",
] as const;

const lastLoginFor = (index: number, status: AdminStatus): string => {
  /* Somebody who has only been invited has never signed in. */
  if (status === "Invited") return "Never";

  const hour = String(6 + (index % 12)).padStart(2, "0");
  const minute = String((index * 7) % 60).padStart(2, "0");

  return `${LOGIN_DAYS[index % LOGIN_DAYS.length]}, ${hour}:${minute}`;
};

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* --- the organization --------------------------------------------- */

const ORGANIZATION_NAME = "Prevoyance IT Solutions";
const ORGANIZATION_DOMAIN = "prevoyancesolutions.com";

/* --- sites -------------------------------------------------------- */

interface PlaceSeed {
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
  dialCode: string;
  street: string;
}

/**
 * The five locations the organization operates from, Mumbai first because it
 * is the registered address. Street addresses and postcodes are placeholders
 * — edit any site from the Sites screen to put the real ones in.
 */
const PLACES: PlaceSeed[] = [
  { city: "Mumbai", state: "Maharashtra", country: "India", postalCode: "400051", timezone: "IST (UTC+5:30)", dialCode: "+91", street: "Bandra Kurla Complex" },
  { city: "Pune", state: "Maharashtra", country: "India", postalCode: "411057", timezone: "IST (UTC+5:30)", dialCode: "+91", street: "Hinjewadi Phase II" },
  { city: "Hyderabad", state: "Telangana", country: "India", postalCode: "500081", timezone: "IST (UTC+5:30)", dialCode: "+91", street: "HITEC City, Madhapur" },
  { city: "Noida", state: "Uttar Pradesh", country: "India", postalCode: "201309", timezone: "IST (UTC+5:30)", dialCode: "+91", street: "Sector 62" },
  { city: "New Delhi", state: "Delhi", country: "India", postalCode: "110019", timezone: "IST (UTC+5:30)", dialCode: "+91", street: "Nehru Place" },
];

/**
 * One entry per place. All five are IT offices — the Mumbai one is the head
 * office, the rest are delivery centres.
 */
const SITE_TYPE_PLAN: AdminSiteType[] = [
  "Head Office",
  "Branch Office",
  "Branch Office",
  "Branch Office",
  "Branch Office",
];

/** Short form used in the site name, so "Head Office — Pune" stays readable. */
const SITE_TYPE_SHORT: Record<AdminSiteType, string> = {
  "Head Office": "HQ",
  "Branch Office": "Branch",
  "Data Centre": "Data Centre",
  Warehouse: "Warehouse",
  "Remote / Home": "Remote",
};

/** The one-line address the lists show, built from the parts a form collects. */
export const formatSiteLocation = (place: {
  city: string;
  state: string;
  country: string;
}): string =>
  [place.city, place.state, place.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

/** Sites before their user counts are folded in. */
type SiteSeed = Omit<AdminSite, "users">;

const SITE_SEED: SiteSeed[] = PLACES.map((place, index) => {
  const siteType = SITE_TYPE_PLAN[index];
  const contact = OWNERS[index % OWNERS.length];

  return {
    id: `site-${index + 1}`,
    name: `${SITE_TYPE_SHORT[siteType]} — ${place.city}`,
    siteType,
    addressLine: `${(index * 13) % 90 + 1} ${place.street}`,
    city: place.city,
    state: place.state,
    country: place.country,
    postalCode: place.postalCode,
    location: formatSiteLocation(place),
    timezone: place.timezone,
    contactName: contact,
    contactEmail: `${slug(contact).replace("-", ".")}@${ORGANIZATION_DOMAIN}`,
    contactPhone: `${place.dialCode} ${90000 + index * 137} ${
      10000 + ((index * 7919) % 80000)
    }`,
    /* Exactly one registered address — the head office it started from. */
    isPrimary: index === 0,
    /* The newest office is still being rolled out. */
    status: index === 4 ? "Trial" : "Active",
    /* Filled in below, once the headcount at each site is known. */
    devices: 0,
  };
});

/* --- users -------------------------------------------------------- */

/**
 * Which site each person works from. Length 13 is coprime with the five
 * sites, so the pattern never falls into lockstep, and site 0 appears five
 * times per cycle — Mumbai carries about 40% of the company, Pune and
 * Hyderabad a quarter each, Noida and Delhi a smaller crew apiece.
 */
const SITE_PATTERN = [0, 1, 0, 2, 3, 0, 4, 1, 0, 2, 0, 1, 2] as const;

const buildUsers = (): AdminUser[] => {
  const taken = new Set<string>();

  return Array.from({ length: TOTAL_USERS }, (_unused, index) => {
    const site = SITE_SEED[SITE_PATTERN[index % SITE_PATTERN.length]];

    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[(index * 7) % LAST_NAMES.length];

    /* Two people can share a name; their sign-in address cannot. */
    let email = `${first}.${last}@${ORGANIZATION_DOMAIN}`.toLowerCase();
    if (taken.has(email))
      email = `${first}.${last}${index}@${ORGANIZATION_DOMAIN}`.toLowerCase();
    taken.add(email);

    /* The first person is the administrator who set the organization up. */
    const isOwner = index === 0;
    const status = isOwner ? "Active" : statusFor(index + 1);

    return {
      id: `user-${index + 1}`,
      name: isOwner ? OWNERS[0] : `${first} ${last}`,
      email: isOwner ? `jane.doe@${ORGANIZATION_DOMAIN}` : email,
      role: isOwner ? "Super Admin" : ROLES[index % ROLES.length],
      siteId: site.id,
      siteName: site.name,
      status,
      lastLogin: lastLoginFor(index, status),
    };
  });
};

export const ADMIN_USERS: AdminUser[] = buildUsers();

/* --- derived counts ----------------------------------------------- */

const usersBySite = ADMIN_USERS.reduce(
  (counts, user) => counts.set(user.siteId, (counts.get(user.siteId) ?? 0) + 1),
  new Map<string, number>(),
);

export const ADMIN_SITES: AdminSite[] = SITE_SEED.map((site) => {
  const users = usersBySite.get(site.id) ?? 0;

  return {
    ...site,
    users,
    /* Roughly one and a half devices per person — a laptop plus a share of
       the printers, phones and meeting-room kit — over a floor's worth of
       shared kit that is there regardless. */
    devices: Math.round(users * 1.6) + 12,
  };
});

/**
 * The organization itself. Mutable on purpose: editing the profile or adding
 * a site updates this object in place, and every screen reads it on mount.
 */
export const ORGANIZATION: AdminOrganization = {
  id: CURRENT_ORGANIZATION_ID,
  name: ORGANIZATION_NAME,
  industry: INDUSTRIES[0],
  status: "Active",
  createdOn: "12 Mar 2021",
  sites: ADMIN_SITES.length,
  users: ADMIN_USERS.length,
  devices: ADMIN_SITES.reduce((sum, site) => sum + site.devices, 0),
};

/* --- lookups ------------------------------------------------------ */

export const findSite = (id: string): AdminSite | undefined =>
  ADMIN_SITES.find((site) => site.id === id);

export const usersForSite = (siteId: string): AdminUser[] =>
  ADMIN_USERS.filter((user) => user.siteId === siteId);

/** The registered address — the site a bill or a legal notice goes to. */
export const primarySite = (): AdminSite | undefined =>
  ADMIN_SITES.find((site) => site.isPrimary);

/** Head office first, then the rest in the order they were added. */
export const sitesInOrder = (): AdminSite[] =>
  [...ADMIN_SITES].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

/**
 * Cities are not stored anywhere — they are whatever the current sites add
 * up to. Opening an office in a new city puts it on the list on its own.
 */
export const citiesInOrder = (): AdminCity[] => {
  const groups = new Map<string, AdminCity>();

  ADMIN_SITES.forEach((site) => {
    const id = slug(site.city);

    const city = groups.get(id) ?? {
      id,
      city: site.city,
      state: site.state,
      country: site.country,
      timezone: site.timezone,
      sites: 0,
      users: 0,
      devices: 0,
      siteNames: [],
    };

    city.sites += 1;
    city.users += site.users;
    city.devices += site.devices;
    city.siteNames.push(site.name);

    groups.set(id, city);
  });

  /* Biggest presence first — that is what somebody scanning the list wants
     to see, not alphabetical order. */
  return [...groups.values()].sort(
    (a, b) => b.users - a.users || b.sites - a.sites,
  );
};

export const findCity = (id: string): AdminCity | undefined =>
  citiesInOrder().find((city) => city.id === id);

export const sitesInCity = (id: string): AdminSite[] =>
  ADMIN_SITES.filter((site) => slug(site.city) === id);

/* --- writes ------------------------------------------------------- */

/**
 * The lists above are plain module-level arrays, so a create or an edit
 * mutates them in place and every screen that reads them on mount picks the
 * change up. The organization's counts are adjusted here rather than
 * recomputed, so the derived numbers stay true after a write.
 */

const nextSiteId = (): string => {
  const highest = ADMIN_SITES.reduce((max, site) => {
    const number = Number(site.id.replace("site-", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `site-${highest + 1}`;
};

/** A site claiming the registered address demotes whichever one held it. */
const applyPrimary = (site: AdminSite): void => {
  if (!site.isPrimary) return;

  ADMIN_SITES.forEach((other) => {
    if (other.id !== site.id) other.isPrimary = false;
  });
};

export const updateOrganization = (
  draft: AdminOrganizationDraft,
): AdminOrganization => {
  Object.assign(ORGANIZATION, draft);
  return ORGANIZATION;
};

export const addSite = (draft: AdminSiteDraft): AdminSite => {
  const site: AdminSite = {
    ...draft,
    id: nextSiteId(),
    location: formatSiteLocation(draft),
    /* Nobody is stationed here and nothing has been discovered on it yet. */
    users: 0,
    devices: 0,
  };

  ADMIN_SITES.unshift(site);
  applyPrimary(site);

  ORGANIZATION.sites += 1;

  return site;
};

export const updateSite = (
  id: string,
  draft: AdminSiteDraft,
): AdminSite | undefined => {
  const site = findSite(id);
  if (!site) return undefined;

  Object.assign(site, draft, { location: formatSiteLocation(draft) });
  applyPrimary(site);

  /* The site name is quoted on every user stationed there. */
  ADMIN_USERS.forEach((user) => {
    if (user.siteId === id) user.siteName = site.name;
  });

  return site;
};

/** What the "Invite User" dialog collects. */
export interface AdminUserDraft {
  name: string;
  email: string;
  role: string;
  siteId: string;
}

/**
 * A new person starts as "Invited" and has never signed in — they only
 * become Active once they accept, which no mock flow can do for them.
 */
export const addUser = (draft: AdminUserDraft): AdminUser | undefined => {
  const site = findSite(draft.siteId);
  if (!site) return undefined;

  const highest = ADMIN_USERS.reduce((max, user) => {
    const number = Number(user.id.replace("user-", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  const user: AdminUser = {
    id: `user-${highest + 1}`,
    name: draft.name,
    email: draft.email,
    role: draft.role,
    siteId: site.id,
    siteName: site.name,
    status: "Invited",
    lastLogin: "Never",
  };

  ADMIN_USERS.unshift(user);
  site.users += 1;
  ORGANIZATION.users += 1;

  return user;
};

/** Marks a location closed rather than deleting it — its history stays. */
export const suspendSite = (id: string): AdminSite | undefined => {
  const site = findSite(id);
  if (!site) return undefined;

  site.status = "Suspended";
  return site;
};

/* --- form options ------------------------------------------------- */

/** Status values available to the filter bars, list order fixed. */
export const ADMIN_STATUS_OPTIONS = [
  "All",
  "Active",
  "Trial",
  "Invited",
  "Suspended",
] as const;

/** What a record can be set to — "All" only ever means "don't filter". */
export const ADMIN_STATUS_VALUES = ADMIN_STATUS_OPTIONS.filter(
  (option): option is AdminStatus => option !== "All",
);

export const ADMIN_INDUSTRY_OPTIONS: readonly string[] = INDUSTRIES;

/** Every role a person can hold, most privileged first. */
export const ADMIN_ROLE_OPTIONS: readonly string[] = ["Super Admin", ...ROLES];

export const ADMIN_ROLE_FILTER_OPTIONS: readonly string[] = [
  "All Roles",
  ...ADMIN_ROLE_OPTIONS,
];

/** Site names for a picker, head office first. */
export const siteOptions = (): string[] =>
  sitesInOrder().map((site) => site.name);

export const findSiteByName = (name: string): AdminSite | undefined =>
  ADMIN_SITES.find((site) => site.name === name);

export const ADMIN_SITE_TYPE_OPTIONS: readonly AdminSiteType[] = [
  "Head Office",
  "Branch Office",
  "Data Centre",
  "Warehouse",
  "Remote / Home",
];

/**
 * Deliberately not derived from the current sites — a form has to be able to
 * open an office somewhere the organization has never been.
 */
export const ADMIN_TIMEZONE_OPTIONS: readonly string[] = [
  "IST (UTC+5:30)",
  "GST (UTC+4:00)",
  "SGT (UTC+8:00)",
  "GMT (UTC+0:00)",
  "CET (UTC+1:00)",
  "EST (UTC-5:00)",
  "CST (UTC-6:00)",
  "PST (UTC-8:00)",
];

export const ADMIN_COUNTRY_OPTIONS: readonly string[] = [
  "India",
  "United Arab Emirates",
  "Singapore",
  "United Kingdom",
  "United States",
  "Australia",
  "Germany",
];
