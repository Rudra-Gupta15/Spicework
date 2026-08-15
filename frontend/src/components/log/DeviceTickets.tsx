import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  DataTable,
  Pagination,
  type Column,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { DEVICE_TICKETS, type LinkedTicket } from "@/data/deviceLog";
import type { Tone } from "@/types/ui";

const STATUS_TONES: Record<LinkedTicket["status"], Tone> = {
  Open: "warning",
  "In Progress": "info",
  Resolved: "success",
  Closed: "neutral",
};

/** Priority text colour — High is the only one that alerts. */
const PRIORITY_CLASS: Record<LinkedTicket["priority"], string> = {
  High: "text-status-offline",
  Medium: "text-heading",
  Low: "text-muted",
};

const columns: Column<LinkedTicket>[] = [
  {
    key: "id",
    header: "ID",
    render: (ticket) => (
      <span className="font-semibold text-brand">{ticket.id}</span>
    ),
  },
  {
    key: "subject",
    header: "Subject",
    className: "max-w-[320px]",
    cellClassName: "truncate font-semibold text-heading",
  },
  {
    key: "status",
    header: "Status",
    render: (ticket) => (
      <Badge tone={STATUS_TONES[ticket.status]}>{ticket.status}</Badge>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    render: (ticket) => (
      <span className={cn("font-semibold", PRIORITY_CLASS[ticket.priority])}>
        {ticket.priority}
      </span>
    ),
  },
  { key: "assignee", header: "Assigned To", cellClassName: "text-muted" },
  { key: "created", header: "Created", cellClassName: "text-muted" },
  { key: "updated", header: "Updated", cellClassName: "text-muted" },
];

/** The Tickets tab: support tickets linked to this device. */
export const DeviceTickets = () => {
  const navigate = useNavigate();

  return (
    <Card className="px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-heading">
          Linked Support Tickets & Issues
        </h2>

        <Button
          variant="brand"
          leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
          onClick={() => navigate("/inventory/ticket/new")}
        >
          Create Ticket
        </Button>
      </div>

      <DataTable
        className="mt-4"
        columns={columns}
        rows={DEVICE_TICKETS}
        rowKey={(ticket) => ticket.id}
        uppercaseHeaders
        bordered
        emptyMessage="No tickets are linked to this device."
      />

      <Pagination
        className="mt-5"
        page={1}
        pageSize={DEVICE_TICKETS.length}
        totalItems={DEVICE_TICKETS.length}
        itemLabel="tickets"
        onPageChange={() => {}}
      />
    </Card>
  );
};
