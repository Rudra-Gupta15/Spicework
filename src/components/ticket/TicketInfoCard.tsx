import type { LucideIcon } from "lucide-react";
import { Clock, Flag, Tag, UserRound } from "lucide-react";

import { Badge, Card } from "@/components/ui";
import type { Ticket, TicketDetail, TicketStatus } from "@/types/ticket";
import type { Tone } from "@/types/ui";

const STATUS_TONES: Record<TicketStatus, Tone> = {
  Open: "info",
  "In Progress": "warning",
  Resolved: "success",
  Closed: "neutral",
};

interface TicketInfoCardProps {
  ticket: Ticket;
  detail: TicketDetail;
}

const Row = ({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} aria-hidden="true" />
      {label}
    </p>
    <div className="mt-1.5">{children}</div>
  </div>
);

/** Status, ownership and dates for the ticket, in the right-hand column. */
export const TicketInfoCard = ({ ticket, detail }: TicketInfoCardProps) => (
  <Card className="px-5 py-4">
    <div className="border-b border-line pb-3.5">
      <h2 className="text-base font-bold text-heading">Ticket Info</h2>
    </div>

    <div className="mt-4 space-y-4">
      <Row icon={Flag} label="Status">
        <Badge tone={STATUS_TONES[ticket.status]}>{ticket.status}</Badge>
      </Row>

      <Row icon={Tag} label="Category">
        <p className="font-semibold text-heading">{detail.category}</p>
      </Row>

      <Row icon={UserRound} label="Reporter">
        <p className="font-semibold text-heading">{detail.reporter}</p>
      </Row>

      <Row icon={Clock} label="Created">
        <p className="text-muted">{detail.created}</p>
      </Row>

      <Row icon={UserRound} label="Assignee">
        <p className="font-semibold text-heading">{ticket.assignee}</p>
      </Row>
    </div>
  </Card>
);
