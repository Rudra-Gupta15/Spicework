import type {
  SavedSearch,
  SavedSearchCategory,
} from "@/types/savedSearch";

/** Mock data — swap these exports for API responses later. */

export const SAVED_SEARCH_TABS: SavedSearchCategory[] = [
  "Hardware",
  "Software",
  "Cloud Assets",
  "Network",
];

export const SAVED_SEARCH_SCOPES = ["Public", "Private"] as const;

/**
 * What the "Create New" dialog opens pre-filled with — the filters the reader
 * would have active on that category's list, plus a suggested name.
 */
export const DEFAULT_SEARCH_DRAFT: Record<
  SavedSearchCategory,
  { name: string; filters: string[] }
> = {
  Hardware: {
    name: "Online Laptops - Dell & HP",
    filters: ["Type: Laptop", "Status: Online", "Manufacturer: Dell, HP"],
  },
  Software: {
    name: "Adobe Apps - Licensed",
    filters: ["Publisher: Adobe", "License: Active"],
  },
  "Cloud Assets": {
    name: "Active SaaS Subscriptions",
    filters: ["Category: SaaS", "Status: Active"],
  },
  Network: {
    name: "Unaudited Hosts - Subnet 1",
    filters: ["Audit Status: Unaudited", "Subnet: 192.168.1.0/24"],
  },
};

/** Dimension names a filter chip contributes, e.g. "Type: Laptop" -> "Type". */
export const filtersLabel = (filters: string[]): string =>
  filters.length === 0
    ? "None"
    : filters.map((filter) => filter.split(":")[0].trim()).join(", ");

/** Finds a saved search across every category. */
export const findSavedSearch = (
  id: string,
): { category: SavedSearchCategory; search: SavedSearch } | null => {
  for (const category of SAVED_SEARCH_TABS) {
    const search = SAVED_SEARCHES[category].find((item) => item.id === id);
    if (search) return { category, search };
  }
  return null;
};

/** Files a new search at the top of its category. */
export const addSavedSearch = (
  category: SavedSearchCategory,
  search: SavedSearch,
): void => {
  SAVED_SEARCHES[category].unshift(search);
};

/** Removes a search from whichever category holds it. */
export const deleteSavedSearch = (id: string): void => {
  for (const category of SAVED_SEARCH_TABS) {
    const list = SAVED_SEARCHES[category];
    const index = list.findIndex((item) => item.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      return;
    }
  }
};

export const SAVED_SEARCHES: Record<SavedSearchCategory, SavedSearch[]> = {
  Hardware: [
    {
      id: "hw-1",
      name: "Online Laptops - Dell & HP",
      scope: "Public",
      filters: "Type, Status, Mfr",
      appliedFilters: ["Type: Laptop", "Status: Online", "Manufacturer: Dell, HP"],
      results: 8,
      createdBy: "John Doe",
      created: "Aug 2, 2026",
    },
    {
      id: "hw-2",
      name: "Windows Servers - Critical",
      scope: "Private",
      filters: "OS, Status",
      results: 12,
      createdBy: "John Doe",
      created: "Jul 28, 2026",
    },
    {
      id: "hw-3",
      name: "Expired Warranties",
      scope: "Public",
      filters: "Warranty Status",
      results: 23,
      createdBy: "Jane Smith",
      created: "Jul 15, 2026",
    },
    {
      id: "hw-4",
      name: "Unassigned Devices",
      scope: "Private",
      filters: "Assigned User",
      results: 45,
      createdBy: "John Doe",
      created: "Jul 10, 2026",
    },
    {
      id: "hw-5",
      name: "HP Printers - Offline",
      scope: "Public",
      filters: "Type, Status, Mfr",
      results: 5,
      createdBy: "Jane Smith",
      created: "Jun 22, 2026",
    },
    {
      id: "hw-6",
      name: "All Desktops - IT Dept",
      scope: "Public",
      filters: "Type, Department",
      results: 34,
      createdBy: "Mike Chen",
      created: "Jun 15, 2026",
    },
    {
      id: "hw-7",
      name: "Low Storage Servers",
      scope: "Private",
      filters: "Type, Storage",
      results: 7,
      createdBy: "John Doe",
      created: "Jun 1, 2026",
    },
    {
      id: "hw-8",
      name: "New Devices This Month",
      scope: "Public",
      filters: "Date Added",
      results: 18,
      createdBy: "Jane Smith",
      created: "May 28, 2026",
    },
  ],

  Software: [
    {
      id: "sw-1",
      name: "Unlicensed Adobe Apps",
      scope: "Public",
      filters: "Publisher, License",
      results: 15,
      createdBy: "John Doe",
      created: "Aug 4, 2026",
    },
    {
      id: "sw-2",
      name: "Expiring Licenses - 30 Days",
      scope: "Public",
      filters: "License Status",
      results: 9,
      createdBy: "Jane Smith",
      created: "Jul 30, 2026",
    },
    {
      id: "sw-3",
      name: "Unused Software - 90 Days",
      scope: "Private",
      filters: "Last Used",
      results: 42,
      createdBy: "John Doe",
      created: "Jul 20, 2026",
    },
    {
      id: "sw-4",
      name: "Microsoft 365 - All Users",
      scope: "Public",
      filters: "Publisher, Type",
      results: 156,
      createdBy: "Mike Chen",
      created: "Jul 12, 2026",
    },
    {
      id: "sw-5",
      name: "Security Tools Audit",
      scope: "Private",
      filters: "Category",
      results: 28,
      createdBy: "Jane Smith",
      created: "Jun 25, 2026",
    },
    {
      id: "sw-6",
      name: "Unapproved Installations",
      scope: "Public",
      filters: "Status, Approval",
      results: 11,
      createdBy: "John Doe",
      created: "Jun 18, 2026",
    },
  ],

  "Cloud Assets": [
    {
      id: "cl-1",
      name: "Suspended Subscriptions",
      scope: "Public",
      filters: "Status",
      results: 6,
      createdBy: "John Doe",
      created: "Jul 30, 2026",
    },
    {
      id: "cl-2",
      name: "AWS - Production Only",
      scope: "Private",
      filters: "Provider, Category",
      results: 19,
      createdBy: "Mike Chen",
      created: "Jul 21, 2026",
    },
    {
      id: "cl-3",
      name: "Renewals Next 60 Days",
      scope: "Public",
      filters: "Renewal Date",
      results: 8,
      createdBy: "Jane Smith",
      created: "Jul 5, 2026",
    },
    {
      id: "cl-4",
      name: "SaaS Over 100 Seats",
      scope: "Public",
      filters: "Category, Users",
      results: 13,
      createdBy: "John Doe",
      created: "Jun 27, 2026",
    },
  ],

  Network: [
    {
      id: "nw-1",
      name: "Unaudited Hosts",
      scope: "Public",
      filters: "Audit Status",
      results: 41,
      createdBy: "Jane Smith",
      created: "Aug 3, 2026",
    },
    {
      id: "nw-2",
      name: "Open Port 445 Devices",
      scope: "Private",
      filters: "Open Ports",
      results: 16,
      createdBy: "John Doe",
      created: "Jul 26, 2026",
    },
    {
      id: "nw-3",
      name: "Offline Access Points",
      scope: "Public",
      filters: "Type, Status",
      results: 3,
      createdBy: "Mike Chen",
      created: "Jul 14, 2026",
    },
    {
      id: "nw-4",
      name: "Guest Network Clients",
      scope: "Public",
      filters: "SSID",
      results: 22,
      createdBy: "Jane Smith",
      created: "Jun 20, 2026",
    },
  ],
};
