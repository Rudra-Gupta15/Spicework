import { useState } from "react";

import {
  Card,
  DataTable,
  PRIMARY_CELL,
  Pagination,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import type { InstalledApp } from "@/types/hardware";

const APP_COLUMNS: Column<InstalledApp>[] = [
  sequenceColumn(),
  {
    key: "name",
    header: "Application Name",
    wrap: true,
    cellClassName: `max-w-[300px] ${PRIMARY_CELL}`,
  },
  { key: "version", header: "Version" },
  {
    key: "publisher",
    header: "Publisher",
    wrap: true,
    cellClassName: "max-w-[160px]",
  },
  { key: "installDate", header: "Install Date" },
  { key: "size", header: "Size" },
  { key: "lastUsed", header: "Last Used" },
];

interface AppsTableProps {
  apps: InstalledApp[];
  pageSize?: number;
  /** Reported estate size when the list holds only the current page of it. */
  totalItems?: number;
}

/** Installed-application table — shared by the device tab and the estate list. */
export const AppsTable = ({
  apps,
  pageSize = 10,
  totalItems,
}: AppsTableProps) => {
  const [page, setPage] = useState(1);
  const visible = apps.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="p-5">
      <DataTable
        columns={APP_COLUMNS}
        rows={visible}
        rowKey={(app) => app.id}
        bordered
        uppercaseHeaders
        emptyMessage="No applications reported."
      />

      <Pagination
        className="mt-5"
        page={page}
        pageSize={pageSize}
        totalItems={totalItems ?? apps.length}
        itemLabel={totalItems ? "software" : "apps"}
        onPageChange={setPage}
      />
    </Card>
  );
};
