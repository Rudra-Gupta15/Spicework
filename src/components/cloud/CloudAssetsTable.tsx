import { DataTable, PRIMARY_CELL, type Column } from "@/components/ui";
import type { CloudService } from "@/types/cloud";

interface CloudAssetsTableProps {
  services: CloudService[];
  /** Opens the service detail screen. */
  onSelect?: (service: CloudService) => void;
  /** Row actions — `onEdit` is a stub until the edit screen exists. */
  onEdit?: (service: CloudService) => void;
  onMore?: (service: CloudService) => void;
}

const actionClass =
  "font-semibold text-heading transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export const CloudAssetsTable = ({
  services,
  onSelect,
  onEdit,
  onMore,
}: CloudAssetsTableProps) => {
  const columns: Column<CloudService>[] = [
    { key: "name", header: "Service Name", cellClassName: PRIMARY_CELL },
    { key: "provider", header: "Provider", cellClassName: "text-muted" },
    { key: "category", header: "Category" },
    { key: "status", header: "Status", cellClassName: "font-semibold" },
    {
      key: "users",
      header: "Users",
      cellClassName: "text-muted",
      render: (service) => `${service.users} users`,
    },
    { key: "monthlyCost", header: "Monthly Cost" },
    { key: "renewalDate", header: "Renewal Date", cellClassName: "text-muted" },
    {
      key: "actions",
      header: "Actions",
      render: (service) => (
        /* The row itself opens the detail screen, so the actions keep the
           click to themselves. */
        <div
          className="flex items-center gap-4"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className={actionClass}
            onClick={() => onEdit?.(service)}
          >
            Edit
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={() => onMore?.(service)}
          >
            More
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={services}
      rowKey={(service) => service.id}
      onRowClick={onSelect}
      bordered
      emptyMessage="No cloud services match the current filters."
    />
  );
};
