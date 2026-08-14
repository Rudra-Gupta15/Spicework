import { useState } from "react";

import {
  Card,
  DataTable,
  PRIMARY_CELL,
  Pagination,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import type { LoginRecord } from "@/types/hardware";

const PAGE_SIZE = 10;

const LOGIN_COLUMNS: Column<LoginRecord>[] = [
  sequenceColumn(),
  {
    key: "user",
    header: "User",
    wrap: true,
    cellClassName: `max-w-[320px] break-all ${PRIMARY_CELL}`,
  },
  { key: "domain", header: "Domain" },
  { key: "logonType", header: "Logon Type" },
  { key: "timestamp", header: "Timestamp" },
];

interface LoginTabProps {
  logins: LoginRecord[];
}

/** Login tab: sign-in history the scan collected from the device. */
export const LoginTab = ({ logins }: LoginTabProps) => {
  const [page, setPage] = useState(1);
  const visible = logins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card className="p-5">
      <DataTable
        columns={LOGIN_COLUMNS}
        rows={visible}
        rowKey={(login) => login.id}
        bordered
        uppercaseHeaders
        emptyMessage="No logins reported for this device."
      />

      <Pagination
        className="mt-5"
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={logins.length}
        itemLabel="logins"
        onPageChange={setPage}
      />
    </Card>
  );
};
