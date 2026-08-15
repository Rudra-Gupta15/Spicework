import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { AdminListView } from "@/components/admin/AdminListView";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { PRIMARY_CELL, type Column } from "@/components/ui";
import { ADMIN_USERS, ORGANIZATION, findSite } from "@/data/admin";
import type { AdminUser } from "@/types/admin";

const COLUMNS: Column<AdminUser>[] = [
  {
    key: "name",
    header: "User",
    render: (user) => (
      <span className="block">
        <span className={`block ${PRIMARY_CELL}`}>{user.name}</span>
        <span className="block text-[12px] text-muted">{user.email}</span>
      </span>
    ),
  },
  { key: "role", header: "Role", cellClassName: "text-muted" },
  { key: "siteName", header: "Site", cellClassName: "text-muted" },
  {
    key: "status",
    header: "Status",
    render: (user) => <AdminStatusBadge status={user.status} />,
  },
  { key: "lastLogin", header: "Last Login", cellClassName: "text-muted" },
];

/**
 * Everyone with portal access. They all belong to the one organization, so
 * the only scope that means anything here is which site they work from.
 */
const AdminUsersPage = () => {
  const [params, setParams] = useSearchParams();

  const site = findSite(params.get("site") ?? "");

  const rows = useMemo(
    () =>
      site ? ADMIN_USERS.filter((user) => user.siteId === site.id) : ADMIN_USERS,
    [site],
  );

  /* Dropping the filter keeps the user on the page, now unscoped. */
  const clearSite = useCallback(() => setParams({}), [setParams]);

  return (
    <AdminListView
      title="Users"
      subtitle={
        site
          ? `People stationed at ${site.name}.`
          : `Everyone with access to the ${ORGANIZATION.name} portal, across every site.`
      }
      tableTitle={site ? `${site.name} — Users` : "All Users"}
      columns={COLUMNS}
      rows={rows}
      rowKey={(user) => user.id}
      searchText={(user) =>
        `${user.name} ${user.email} ${user.role} ${user.siteName}`
      }
      status={(user) => user.status}
      searchPlaceholder="Search users..."
      itemLabel="users"
      emptyMessage="No users match the current filters."
      context={
        site ? { label: "Site", value: site.name, onClear: clearSite } : undefined
      }
    />
  );
};

export default AdminUsersPage;
