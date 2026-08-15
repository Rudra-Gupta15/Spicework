import { FileText } from "lucide-react";

import { Badge, DataTable, type Column } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Ticket, TicketPriority, TicketStatus } from "@/types/ticket";
import type { Tone } from "@/types/ui";

const STATUS_TONES: Record<TicketStatus, Tone> = {
  Open: "info",
  "In Progress": "warning",
  Resolved: "success",
  Closed: "neutral",
};

/** Dot colour per priority — the label always carries the meaning too. */
const PRIORITY_DOTS: Record<TicketPriority, string> = {
  Critical: "bg-status-offline",
  High: "bg-status-offline",
  Medium: "bg-status-maintenance",
  Low: "bg-status-info",
};

interface TicketTableProps {
  tickets: Ticket[];
  onSelect?: (ticket: Ticket) => void;
}

export const TicketTable = ({ tickets, onSelect }: TicketTableProps) => {
  const columns: Column<Ticket>[] = [
    {
      key: "id",
      header: "ID",
      render: (ticket) => (
        <span className="flex items-center gap-2 font-semibold text-brand">
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.9} />#
          {ticket.id}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      className: "max-w-[280px]",
      cellClassName: "truncate font-medium text-heading",
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
        <span className="flex items-center gap-2 font-semibold text-heading">
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              PRIORITY_DOTS[ticket.priority],
            )}
          />
          {ticket.priority}
        </span>
      ),
    },
    { key: "assignee", header: "Assignee" },
    { key: "updated", header: "Updated", cellClassName: "text-muted" },
  ];

  return (
    <DataTable
      columns={columns}
      rows={tickets}
      rowKey={(ticket) => ticket.id}
      onRowClick={onSelect}
      emptyMessage="No tickets match the current filters."
      /* The card supplies the top edge, so the header drops its own. */
      className="[&_thead_tr]:border-t-0"
    />
  );
};
