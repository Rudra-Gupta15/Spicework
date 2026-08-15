import type { LucideIcon } from "lucide-react";
import { Building2, MapPin, Monitor, UserRound } from "lucide-react";

import { ADMIN_SITES, ADMIN_USERS } from "./admin";

/** Mock data — swap these exports for API responses later. */

/**
 * The dashboard's own tile shape. Richer than the `StatMetric` the inner
 * pages use: each tile carries a line saying what it counts, and only the
 * ones that actually open a list are links.
 */
export interface DashboardTile {
  id: string;
  label: string;
  value: string;
  /** One line under the number — what the set actually is. */
  hint: string;
  icon: LucideIcon;
  /** The list this tile opens. Tiles without one are read-only stats. */
  to?: string;
}

/**
 * Each tile counts the set its own drill-down opens, so the number on the
 * dashboard and the number on the screen it opens can never disagree.
 *
 * A function rather than a constant: adding a site or inviting a user
 * mutates the shared arrays, and a value captured at module load would go
 * on showing the count from the moment the app started.
 */
export const adminStats = (): DashboardTile[] => {
  const devices = ADMIN_SITES.reduce((sum, site) => sum + site.devices, 0);
  const cities = new Set(ADMIN_SITES.map((site) => site.city)).size;

  return [
    {
      id: "sites",
      label: "Total Sites",
      value: ADMIN_SITES.length.toString(),
      hint: "Offices and delivery centres",
      icon: MapPin,
      to: "/dashboard/sites",
    },
    {
      id: "users",
      label: "Total Users",
      value: ADMIN_USERS.length.toLocaleString(),
      hint: "People with access to the portal",
      icon: UserRound,
      to: "/dashboard/users",
    },
    {
      id: "devices",
      label: "Total Devices",
      value: devices.toLocaleString(),
      hint: "Discovered across every site",
      icon: Monitor,
      /* The devices themselves live in the hardware inventory, not in the
         admin area — this tile is the way through to them. */
      to: "/inventory/hardware",
    },
    {
      id: "cities",
      label: "Cities Covered",
      value: cities.toString(),
      hint: "Cities the sites are spread across",
      icon: Building2,
      to: "/dashboard/cities",
    },
  ];
};
