import { Search } from "lucide-react";

import { Card, Input, Select } from "@/components/ui";
import { TICKET_FILTER_OPTIONS } from "@/data/tickets";
import type { TicketFilterState } from "@/types/ticket";

interface TicketFiltersProps {
  filters: TicketFilterState;
  onChange: (patch: Partial<TicketFilterState>) => void;
}

/** Search box plus the three queue dimensions, in one card above the list. */
export const TicketFilters = ({ filters, onChange }: TicketFiltersProps) => (
  <Card className="flex flex-wrap items-center gap-3 p-4">
    <Input
      type="search"
      size="md"
      value={filters.search}
      onChange={(event) => onChange({ search: event.target.value })}
      placeholder="Search tickets..."
      aria-label="Search tickets"
      leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
      containerClassName="min-w-[220px] flex-1"
    />

    <Select
      size="md"
      label="Status:"
      aria-label="Filter by status"
      options={TICKET_FILTER_OPTIONS.status}
      value={filters.status}
      onChange={(status) => onChange({ status })}
    />

    <Select
      size="md"
      label="Priority:"
      aria-label="Filter by priority"
      options={TICKET_FILTER_OPTIONS.priority}
      value={filters.priority}
      onChange={(priority) => onChange({ priority })}
    />

    <Select
      size="md"
      label="Assignee:"
      align="right"
      aria-label="Filter by assignee"
      options={TICKET_FILTER_OPTIONS.assignee}
      value={filters.assignee}
      onChange={(assignee) => onChange({ assignee })}
    />
  </Card>
);
