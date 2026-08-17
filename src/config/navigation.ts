import {
  Boxes,
  FileText,
  Funnel,
  Monitor,
  Settings,
  UserRound,
} from "lucide-react";

import type { NavItem } from "@/types/navigation";

/**
 * Single source of truth for the app's navigation.
 * The sidebar, the routes and the page header (Navbar) are all generated
 * from this array — add an entry here and the whole app picks it up.
 */
export const NAVIGATION: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Monitor,
    path: "/dashboard",
    subtitle: "Overview of your network health, tickets and assets.",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
    children: [
      {
        id: "hardware",
        label: "Hardware",
        path: "/inventory/hardware",
        subtitle:
          "Track hardware devices, warranties, and maintenance across your network.",
      },
      {
        id: "software",
        label: "Software",
        path: "/inventory/software",
        subtitle: "Track installed software, licenses and renewals.",
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    path: "/reports",
    subtitle: "Generate and schedule reports across your organisation.",
  },
  {
    id: "saved-search",
    label: "Filter",
    icon: Funnel,
    path: "/saved-search",
    subtitle: "Re-run the searches your team uses most.",
  },
  {
    id: "agent",
    label: "Agent",
    icon: UserRound,
    path: "/agent",
    subtitle: "Deploy and monitor collector agents on your devices.",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    subtitle: "Configure your organisation, users and integrations.",
  },
];

/** Where a signed-in user lands — after login, and from a dead link. */
export const DEFAULT_ROUTE = "/dashboard";
