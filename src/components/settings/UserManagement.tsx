import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { LogAvatar } from "@/components/log/LogAvatar";
import {
  Card,
  DataTable,
  Input,
  Pagination,
  Select,
  type Column,
} from "@/components/ui";
import {
  ADMIN_ROLE_FILTER_OPTIONS,
  ADMIN_USERS,
  addUser,
  type AdminUserDraft,
} from "@/data/admin";
import type { AdminUser } from "@/types/admin";

import { InviteMemberModal } from "./InviteMemberModal";

const PAGE_SIZE = 8;
const ALL_ROLES = "All Roles";

interface UserManagementProps {
  /** Controlled by the page's "Invite User" header button. */
  inviteOpen: boolean;
  onCloseInvite: () => void;
}

const columns: Column<AdminUser>[] = [
  {
    key: "user",
    header: "User",
    render: (user) => (
      <div className="flex items-center gap-3">
        <LogAvatar name={user.name} kind="user" />
        <div className="min-w-0">
          <p className="font-semibold text-heading">{user.name}</p>
          <p className="text-[13px] text-muted">{user.email}</p>
        </div>
      </div>
    ),
  },
  { key: "role", header: "Role" },
  /* Where somebody works is the organization's own structure — a free-text
     department would be a second, unmanaged one. */
  { key: "siteName", header: "Site", cellClassName: "text-muted" },
  {
    key: "status",
    header: "Status",
    render: (user) => <AdminStatusBadge status={user.status} />,
  },
  { key: "lastLogin", header: "Last Login", cellClassName: "text-muted" },
  {
    key: "actions",
    header: "Actions",
    render: () => (
      <button
        type="button"
        className="font-semibold text-brand transition-colors hover:text-brand-600 focus-visible:outline-none"
      >
        Edit
      </button>
    ),
  },
];

/** The User Management category: everybody with access, and their roles. */
export const UserManagement = ({
  inviteOpen,
  onCloseInvite,
}: UserManagementProps) => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ALL_ROLES);
  const [page, setPage] = useState(1);
  /* A snapshot of the shared roster. `addUser` mutates that array in place,
     so its identity never changes and React would not see the new row —
     keeping the list in state is what makes the invite show up. */
  const [roster, setRoster] = useState<AdminUser[]>(() => [...ADMIN_USERS]);

  const members = useMemo(() => {
    const term = search.trim().toLowerCase();

    return roster.filter(
      (user) =>
        (role === ALL_ROLES || user.role === role) &&
        (term === "" ||
          `${user.name} ${user.email} ${user.siteName}`
            .toLowerCase()
            .includes(term)),
    );
  }, [roster, search, role]);

  /* Clamping beats resetting: narrowing the filters can never strand the
     view on a page that no longer exists. */
  const lastPage = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const visible = useMemo(
    () => members.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [members, currentPage],
  );

  const invite = useCallback(
    (draft: AdminUserDraft) => {
      /* Written to the shared roster first, so the dashboard tile and the
         site's headcount move with it, then mirrored into local state. */
      const user = addUser(draft);
      if (user) setRoster((current) => [user, ...current]);

      setPage(1);
      onCloseInvite();
    },
    [onCloseInvite],
  );

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Input
          type="search"
          size="md"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email or site..."
          aria-label="Search users"
          leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
          containerClassName="min-w-[220px] flex-1"
        />
        <Select
          size="md"
          label="Role:"
          options={ADMIN_ROLE_FILTER_OPTIONS}
          value={role}
          onChange={(value) => {
            setRole(value);
            setPage(1);
          }}
          aria-label="Filter by role"
        />
      </Card>

      <Card className="px-5 py-5">
        <DataTable
          columns={columns}
          rows={visible}
          rowKey={(user) => user.id}
          uppercaseHeaders
          bordered
          emptyMessage="No users match your search."
        />

        <Pagination
          className="mt-5"
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={members.length}
          itemLabel="users"
          variant={lastPage > 5 ? "numbered" : "prev-next"}
          onPageChange={setPage}
        />
      </Card>

      {inviteOpen && (
        <InviteMemberModal onClose={onCloseInvite} onInvite={invite} />
      )}
    </div>
  );
};
