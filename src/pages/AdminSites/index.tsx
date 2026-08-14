import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

import { AdminListView } from "@/components/admin/AdminListView";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Badge, Button, PRIMARY_CELL, type Column } from "@/components/ui";
import { ORGANIZATION, findCity, sitesInCity, sitesInOrder } from "@/data/admin";
import type { AdminSite } from "@/types/admin";

const SITES_ROUTE = "/dashboard/sites";

const COLUMNS: Column<AdminSite>[] = [
  {
    key: "name",
    header: "Site",
    render: (site) => (
      <span className="block">
        <span className={`block ${PRIMARY_CELL}`}>
          {site.name}
          {/* The registered address is where a bill or a notice goes, so it
              is called out rather than left to the row order. */}
          {site.isPrimary && (
            <Badge tone="brand" className="ml-2 align-middle">
              Primary
            </Badge>
          )}
        </span>
        <span className="block text-[12px] text-muted">{site.siteType}</span>
      </span>
    ),
  },
  {
    key: "location",
    header: "Location",
    wrap: true,
    render: (site) => (
      <span className="block">
        <span className="block text-heading">{site.location}</span>
        <span className="block text-[12px] text-muted">{site.addressLine}</span>
      </span>
    ),
  },
  { key: "timezone", header: "Timezone", cellClassName: "text-muted" },
  {
    key: "contactName",
    header: "Site Contact",
    render: (site) => (
      <span className="block">
        <span className="block text-heading">{site.contactName}</span>
        <span className="block text-[12px] text-muted">{site.contactEmail}</span>
      </span>
    ),
  },
  { key: "users", header: "Users", align: "right", cellClassName: "tabular-nums text-muted" },
  { key: "devices", header: "Devices", align: "right", cellClassName: "tabular-nums text-muted" },
  {
    key: "status",
    header: "Status",
    render: (site) => <AdminStatusBadge status={site.status} />,
  },
];

/**
 * Every location the organization operates from. No stat tiles: the same
 * counts are on the dashboard this page is opened from, and the table's own
 * Users and Devices columns carry the per-site numbers.
 */
const AdminSitesPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  /* Arrives scoped when opened from the cities list. */
  const city = findCity(params.get("city") ?? "");

  const rows = useMemo(
    () => (city ? sitesInCity(city.id) : sitesInOrder()),
    [city],
  );

  const openSite = useCallback(
    (site: AdminSite) => navigate(`${SITES_ROUTE}/${site.id}`),
    [navigate],
  );

  /* Dropping the filter keeps the user on the page, now unscoped. */
  const clearCity = useCallback(() => setParams({}), [setParams]);

  return (
    <AdminListView
      title="Sites"
      subtitle={
        city
          ? `Locations ${ORGANIZATION.name} operates from in ${city.city}.`
          : `Locations ${ORGANIZATION.name} operates from, with the people and devices at each.`
      }
      tableTitle={city ? `${city.city} — Sites` : "All Sites"}
      hint="Select a site to edit its address, contact and status."
      context={
        city ? { label: "City", value: city.city, onClear: clearCity } : undefined
      }
      columns={COLUMNS}
      rows={rows}
      rowKey={(site) => site.id}
      searchText={(site) =>
        `${site.name} ${site.location} ${site.siteType} ${site.timezone} ${site.contactName}`
      }
      status={(site) => site.status}
      searchPlaceholder="Search sites..."
      itemLabel="sites"
      emptyMessage="No sites match the current filters."
      actions={
        <Button
          variant="brand"
          leftIcon={<Plus className="h-4 w-4" strokeWidth={2.2} />}
          onClick={() => navigate(`${SITES_ROUTE}/new`)}
        >
          Add Site
        </Button>
      }
      onRowClick={openSite}
    />
  );
};

export default AdminSitesPage;
