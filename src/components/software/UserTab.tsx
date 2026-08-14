import { useState } from "react";

import {
  Card,
  DataTable,
  PRIMARY_CELL,
  Pagination,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import type { UserAccount } from "@/types/hardware";

const PAGE_SIZE = 10;

const USER_COLUMNS: Column<UserAccount>[] = [
  sequenceColumn(),
  {
    key: "username",
    header: "Username",
    wrap: true,
    cellClassName: `max-w-[300px] ${PRIMARY_CELL}`,
  },
  {
    key: "homeDirectory",
    header: "Home Directory",
    wrap: true,
    cellClassName: "max-w-[180px] break-all",
  },
  { key: "lastLogin", header: "Last Login" },
  { key: "licensed", header: "Licensed" },
  { key: "userType", header: "User Type" },
  { key: "currentUser", header: "Current User" },
];

interface UserTabProps {
  users: UserAccount[];
}

/** User tab: local accounts, with their licensing state. */
export const UserTab = ({ users }: UserTabProps) => {
  const [page, setPage] = useState(1);
  const visible = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card className="p-5">
      <DataTable
        columns={USER_COLUMNS}
        rows={visible}
        rowKey={(user) => user.id}
        bordered
        uppercaseHeaders
        emptyMessage="No users reported for this device."
      />

      <Pagination
        className="mt-5"
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={users.length}
        itemLabel="users"
        onPageChange={setPage}
      />
    </Card>
  );
};
