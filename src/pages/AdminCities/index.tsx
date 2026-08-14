import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { AdminListView } from "@/components/admin/AdminListView";
import { PRIMARY_CELL, type Column } from "@/components/ui";
import { ORGANIZATION, citiesInOrder } from "@/data/admin";
import type { AdminCity } from "@/types/admin";

const SITES_ROUTE = "/dashboard/sites";

const COLUMNS: Column<AdminCity>[] = [
  {
    key: "city",
    header: "City",
    render: (city) => (
      <span className="block">
        <span className={`block ${PRIMARY_CELL}`}>{city.city}</span>
        <span className="block text-[12px] text-muted">
          {city.state}, {city.country}
        </span>
      </span>
    ),
  },
  {
    key: "siteNames",
    header: "Sites Here",
    wrap: true,
    cellClassName: "max-w-[280px]",
    render: (city) => (
      <span className="block text-[13px] text-muted">
        {city.siteNames.join(", ")}
      </span>
    ),
  },
  { key: "timezone", header: "Timezone", cellClassName: "text-muted" },
  { key: "sites", header: "Sites", align: "right", cellClassName: "tabular-nums text-muted" },
  { key: "users", header: "Users", align: "right", cellClassName: "tabular-nums text-muted" },
  { key: "devices", header: "Devices", align: "right", cellClassName: "tabular-nums text-muted" },
];

/**
 * The estate rolled up by city — where the organization actually has a
 * presence, rather than how many buildings it rents. A city has no lifecycle
 * of its own, so there is no status filter here; selecting one opens the
 * sites list scoped to it.
 */
const AdminCitiesPage = () => {
  const navigate = useNavigate();

  const rows = useMemo(() => citiesInOrder(), []);

  const openCity = useCallback(
    (city: AdminCity) => navigate(`${SITES_ROUTE}?city=${city.id}`),
    [navigate],
  );

  return (
    <AdminListView
      title="Cities Covered"
      subtitle={`Where ${ORGANIZATION.name} has a presence, with everything it runs in each city.`}
      tableTitle="All Cities"
      hint="Select a city to see the sites in it. Cities are derived from the sites — adding one in a new city puts it here on its own."
      columns={COLUMNS}
      rows={rows}
      rowKey={(city) => city.id}
      searchText={(city) =>
        `${city.city} ${city.state} ${city.country} ${city.siteNames.join(" ")}`
      }
      searchPlaceholder="Search cities..."
      itemLabel="cities"
      emptyMessage="No cities match the current search."
      onRowClick={openCity}
    />
  );
};

export default AdminCitiesPage;
