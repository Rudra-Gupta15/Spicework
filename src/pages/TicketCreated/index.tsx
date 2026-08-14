import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";

import { Button, Card } from "@/components/ui";
import { TICKETS } from "@/data/tickets";

const TICKET_ROUTE = "/inventory/ticket";

const TicketCreatedPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const ticket = useMemo(
    () => TICKETS.find((item) => item.id === ticketId),
    [ticketId],
  );

  /* Deep link to a ticket that is not in the current queue. */
  if (!ticket) return <Navigate to={TICKET_ROUTE} replace />;

  return (
    <Card className="mx-auto mt-10 max-w-[580px] px-5 py-8 text-center sm:mt-16 sm:px-8 sm:py-10">
      <span
        aria-hidden="true"
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-signal-50 text-signal-600"
      >
        <Check className="h-7 w-7" strokeWidth={2.2} />
      </span>

      <h1 className="mt-5 text-[26px] leading-tight font-bold text-heading">
        Ticket Created Successfully
      </h1>

      <p className="mt-1.5 font-bold text-brand">Ticket ID #{ticket.id}</p>

      <p className="mx-auto mt-3 max-w-[440px] text-sm leading-relaxed text-muted">
        Your help desk ticket has been submitted and assigned to{" "}
        {ticket.assignee}. You will receive email notifications on status
        updates.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3 border-t border-line pt-6">
        <Button variant="outlinePrimary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`${TICKET_ROUTE}/${ticket.id}`)}
        >
          View Ticket
        </Button>
      </div>
    </Card>
  );
};

export default TicketCreatedPage;
