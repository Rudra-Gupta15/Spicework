import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

import {
  Badge,
  DataTable,
  ProgressBar,
  SectionCard,
  type Column,
} from "@/components/ui";
import { DEVICE_AUDITS } from "@/data/dashboard";
import type { DeviceAudit } from "@/types/dashboard";

const PASS_THRESHOLD = 80;

/** Link that opens the full list — reused by both list cards. */
const ViewAllLink = ({ to }: { to: string }) => (
  <Link
    to={to}
    className="text-sm font-semibold text-status-info hover:underline"
  >
    View All
  </Link>
);

export const RecentAuditsCard = () => {
  const columns = useMemo<Column<DeviceAudit>[]>(
    () => [
      {
        key: "device",
        header: "Device Name",
        render: (row) => (
          <Link
            to="/inventory/hardware"
            className="font-semibold text-status-info hover:underline"
          >
            {row.device}
          </Link>
        ),
      },
      { key: "ip", header: "IP Address" },
      { key: "os", header: "OS" },
      { key: "auditedOn", header: "Last Audit Date" },
      {
        key: "score",
        header: "Compliance Score",
        render: (row) => (
          <span className="flex items-center gap-2.5">
            <ProgressBar
              value={row.score}
              color={
                row.score >= PASS_THRESHOLD
                  ? "var(--color-status-online)"
                  : "var(--color-status-offline)"
              }
              className="w-20"
              label={`${row.device} compliance score`}
            />
            <span className="font-semibold tabular-nums">{row.score}%</span>
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <Badge tone={row.status === "Pass" ? "success" : "danger"}>
            {row.status}
          </Badge>
        ),
      },
      {
        key: "action",
        header: "Action",
        render: (row) => (
          <span className="flex items-center gap-2">
            <Link
              to="/inventory/hardware"
              className="text-sm font-semibold text-status-info hover:underline"
            >
              View Details
            </Link>
            <button
              type="button"
              aria-label={`More actions for ${row.device}`}
              className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-heading"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <SectionCard
      title="Recent Device Audits"
      action={<ViewAllLink to="/log" />}
      flush
      bodyClassName="pb-2"
    >
      <DataTable
        columns={columns}
        rows={DEVICE_AUDITS}
        rowKey={(row) => row.id}
      />
    </SectionCard>
  );
};
