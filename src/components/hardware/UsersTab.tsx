import { ManualBadge } from "@/components/common/ManualBadge";
import {
  Card,
  DataTable,
  PRIMARY_CELL,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import type { UserAccount } from "@/types/hardware";

const USER_COLUMNS: Column<UserAccount>[] = [
  sequenceColumn(),
  {
    key: "username",
    header: "Username",
    wrap: true,
    cellClassName: `max-w-[200px] ${PRIMARY_CELL}`,
    render: (user) => (
      <span className="inline-flex items-center">
        {user.username}
        {user.manuallyCorrected && <ManualBadge />}
      </span>
    ),
  },
  {
    key: "homeDirectory",
    header: "Home Directory",
    wrap: true,
    cellClassName: "max-w-[220px] break-all",
  },
  { key: "lastLogin", header: "Last Login" },
  { key: "userType", header: "User Type" },
];

interface UsersTabProps {
  users: UserAccount[];
}

/** Users tab: every local account the scan found on the device. */
export const UsersTab = ({ users }: UsersTabProps) => (
  <Card className="px-5 pt-5 pb-6">
    <h2 className="text-base font-bold text-heading">User Accounts</h2>

    <DataTable
      className="mt-4"
      columns={USER_COLUMNS}
      rows={users}
      rowKey={(user) => user.id}
      bordered
      uppercaseHeaders
      emptyMessage="No user accounts reported for this device."
    />
  </Card>
);
