import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  Badge,
  Card,
  DataTable,
  Input,
  PRIMARY_CELL,
  Pagination,
  type Column,
} from "@/components/ui";
import { DEVICE_SOFTWARE, TOTAL_SOFTWARE } from "@/data/deviceLog";
import type { InstalledPackage } from "@/data/deviceLog";

const PAGE_SIZE = 7;

const columns: Column<InstalledPackage>[] = [
  { key: "name", header: "Software Name", cellClassName: PRIMARY_CELL },
  { key: "version", header: "Version", cellClassName: "text-muted" },
  { key: "publisher", header: "Publisher", cellClassName: "text-muted" },
  { key: "installDate", header: "Install Date", cellClassName: "text-muted" },
  { key: "size", header: "Size", cellClassName: "text-muted" },
  {
    key: "status",
    header: "Status",
    render: (pkg) => (
      <Badge tone={pkg.status === "Update available" ? "warning" : "success"}>
        {pkg.status}
      </Badge>
    ),
  },
];

/** The Software tab: searchable list of installed packages. */
export const DeviceSoftware = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return DEVICE_SOFTWARE;
    return DEVICE_SOFTWARE.filter((pkg) =>
      `${pkg.name} ${pkg.publisher}`.toLowerCase().includes(term),
    );
  }, [search]);

  const visible = useMemo(
    () => matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [matches, page],
  );

  /* Unfiltered, the list is one page of the full catalog. */
  const total = search.trim() ? matches.length : TOTAL_SOFTWARE;

  return (
    <Card className="px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-heading">
          Installed Software Packages
        </h2>

        <Input
          type="search"
          size="sm"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search packages..."
          aria-label="Search packages"
          leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
          containerClassName="w-full sm:w-64"
        />
      </div>

      <DataTable
        className="mt-4"
        columns={columns}
        rows={visible}
        rowKey={(pkg) => pkg.id}
        uppercaseHeaders
        bordered
        emptyMessage="No packages match your search."
      />

      <Pagination
        className="mt-5"
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={total}
        itemLabel="apps"
        onPageChange={setPage}
      />
    </Card>
  );
};
