import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { TicketFilters } from "@/components/ticket/TicketFilters";
import { TicketTable } from "@/components/ticket/TicketTable";
import { Button, Card, Pagination } from "@/components/ui";
import {
  DEFAULT_TICKET_FILTERS,
  TICKETS,
  filterTickets,
} from "@/data/tickets";
import type { Ticket, TicketFilterState } from "@/types/ticket";

const PAGE_SIZE = 6;
const TICKET_ROUTE = "/inventory/ticket";

const TicketPage = () => {
  const navigate = useNavigate();

  const [tickets] = useState<Ticket[]>(TICKETS);
  const [filters, setFilters] = useState<TicketFilterState>(
    DEFAULT_TICKET_FILTERS,
  );
  const [page, setPage] = useState(1);

  /* Any filter change puts the reader back on the first page. */
  const handleFilterChange = useCallback((patch: Partial<TicketFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const matches = useMemo(
    () => filterTickets(tickets, filters),
    [tickets, filters],
  );

  const visible = useMemo(
    () => matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [matches, page],
  );

  const openTicket = useCallback(
    (ticket: Ticket) => navigate(`${TICKET_ROUTE}/${ticket.id}`),
    [navigate],
  );

  return (
    <>
      <Navbar
        title="All Tickets"
        subtitle=""
        actions={
          <>
            <Button
              variant="brand"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
              onClick={() => navigate(`${TICKET_ROUTE}/new`)}
            >
              Create Ticket
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </>
        }
      />

      <div className="mt-6 space-y-5">
        <TicketFilters filters={filters} onChange={handleFilterChange} />

        <Card className="overflow-hidden">
          <TicketTable tickets={visible} onSelect={openTicket} />

          <div className="border-t border-line px-5 py-3.5">
            <Pagination
              variant="numbered"
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={matches.length}
              itemLabel="tickets"
              onPageChange={setPage}
            />
          </div>
        </Card>
      </div>
    </>
  );
};

export default TicketPage;
