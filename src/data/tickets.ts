import type {
  Ticket,
  TicketDraft,
  TicketFilterState,
  TicketPriority,
  TicketStatus,
} from "@/types/ticket";

import { registerTicketDetail } from "./ticketDetail";

/** Mock data — swap these exports for API responses later. */

export const TICKETS: Ticket[] = [
  {
    id: "HD-4892",
    subject: "VPN Connection Failing on Remote Laptops",
    status: "Open",
    priority: "High",
    assignee: "Cloud Ops Team",
    updated: "Jul 30, 2026",
  },
  {
    id: "HD-4889",
    subject: "MacBook Pro trackpad unresponsive",
    status: "In Progress",
    priority: "Medium",
    assignee: "Jane Doe",
    updated: "Jul 30, 2026",
  },
  {
    id: "HD-4885",
    subject: "Office Wi-Fi dropouts on 2nd Floor",
    status: "Open",
    priority: "Critical",
    assignee: "Network Admin",
    updated: "Jul 28, 2026",
  },
  {
    id: "HD-4870",
    subject: "New employee onboarding software access",
    status: "Resolved",
    priority: "Low",
    assignee: "Jane Doe",
    updated: "Jul 26, 2026",
  },
  {
    id: "HD-4861",
    subject: "Printers in HR dept jamming constantly",
    status: "Closed",
    priority: "Low",
    assignee: "IT Helpdesk",
    updated: "Jul 22, 2026",
  },
  {
    id: "HD-4850",
    subject: "SaaS Subscription Billing issue",
    status: "Closed",
    priority: "Medium",
    assignee: "Billing Ops",
    updated: "Jul 16, 2026",
  },
  {
    id: "HD-4848",
    subject: "Outlook profile corrupted after update",
    status: "In Progress",
    priority: "High",
    assignee: "IT Helpdesk",
    updated: "Jul 15, 2026",
  },
  {
    id: "HD-4844",
    subject: "Request: second monitor for design desk",
    status: "Open",
    priority: "Low",
    assignee: "Asset Team",
    updated: "Jul 14, 2026",
  },
  {
    id: "HD-4839",
    subject: "Salesforce SSO login loop for sales team",
    status: "In Progress",
    priority: "Critical",
    assignee: "Cloud Ops Team",
    updated: "Jul 12, 2026",
  },
  {
    id: "HD-4835",
    subject: "Backup job failing on SRV-BACKUP-01",
    status: "Open",
    priority: "High",
    assignee: "Network Admin",
    updated: "Jul 11, 2026",
  },
  {
    id: "HD-4830",
    subject: "Zoom room controller offline in Boardroom",
    status: "Resolved",
    priority: "Medium",
    assignee: "IT Helpdesk",
    updated: "Jul 09, 2026",
  },
  {
    id: "HD-4826",
    subject: "Laptop battery replacement — FIN-WS-014",
    status: "Closed",
    priority: "Low",
    assignee: "Asset Team",
    updated: "Jul 08, 2026",
  },
  {
    id: "HD-4821",
    subject: "Shared drive permissions for Legal folder",
    status: "In Progress",
    priority: "Medium",
    assignee: "Jane Doe",
    updated: "Jul 06, 2026",
  },
  {
    id: "HD-4815",
    subject: "Phishing email reported by 3 users",
    status: "Resolved",
    priority: "Critical",
    assignee: "Security Team",
    updated: "Jul 03, 2026",
  },
  {
    id: "HD-4809",
    subject: "Azure AD group sync delay",
    status: "Open",
    priority: "Medium",
    assignee: "Cloud Ops Team",
    updated: "Jul 02, 2026",
  },
  {
    id: "HD-4802",
    subject: "Slack notifications not firing on mobile",
    status: "Closed",
    priority: "Low",
    assignee: "IT Helpdesk",
    updated: "Jun 30, 2026",
  },
  {
    id: "HD-4798",
    subject: "Conference room printer needs firmware update",
    status: "Open",
    priority: "Low",
    assignee: "Asset Team",
    updated: "Jun 28, 2026",
  },
  {
    id: "HD-4791",
    subject: "AWS cost alert threshold breached",
    status: "In Progress",
    priority: "High",
    assignee: "Billing Ops",
    updated: "Jun 26, 2026",
  },
  {
    id: "HD-4785",
    subject: "Antivirus agent missing on 4 workstations",
    status: "Open",
    priority: "High",
    assignee: "Security Team",
    updated: "Jun 24, 2026",
  },
  {
    id: "HD-4779",
    subject: "Guest Wi-Fi captive portal not loading",
    status: "Resolved",
    priority: "Medium",
    assignee: "Network Admin",
    updated: "Jun 22, 2026",
  },
  {
    id: "HD-4772",
    subject: "Onboarding: laptop imaging for 5 new hires",
    status: "Closed",
    priority: "Medium",
    assignee: "Asset Team",
    updated: "Jun 19, 2026",
  },
  {
    id: "HD-4766",
    subject: "Database connection timeouts in reporting app",
    status: "Resolved",
    priority: "Critical",
    assignee: "Cloud Ops Team",
    updated: "Jun 17, 2026",
  },
  {
    id: "HD-4759",
    subject: "Password reset policy questions from HR",
    status: "Closed",
    priority: "Low",
    assignee: "Jane Doe",
    updated: "Jun 15, 2026",
  },
  {
    id: "HD-4750",
    subject: "Legacy hosting renewal decision needed",
    status: "Open",
    priority: "Medium",
    assignee: "Billing Ops",
    updated: "Jun 12, 2026",
  },
];

export const TICKET_STATUSES: TicketStatus[] = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

/** Queues a new request can be filed against. */
export const TICKET_CATEGORIES = [
  "Network",
  "Hardware",
  "Software",
  "Billing",
  "Security",
  "General",
];

export const TICKET_PRIORITIES: TicketPriority[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

/** Every filter uses the same "no filter" label. */
export const ALL = "All";

/** Options derived from the data so they never fall out of sync. */
export const TICKET_ASSIGNEES = [
  ...new Set(TICKETS.map((ticket) => ticket.assignee)),
];

/** Assignee value that lets the category pick the team. */
export const AUTO_ASSIGN = "Auto-assign";

export const TICKET_ASSIGNEE_OPTIONS = [AUTO_ASSIGN, ...TICKET_ASSIGNEES];

/** Team a category is routed to when the reporter does not pick one. */
const TEAM_BY_CATEGORY: Record<string, string> = {
  Network: "Network Admin",
  Hardware: "Asset Team",
  Software: "IT Helpdesk",
  Billing: "Billing Ops",
  Security: "Security Team",
  General: "IT Helpdesk",
};

export const teamForCategory = (category: string): string =>
  TEAM_BY_CATEGORY[category] ?? "IT Helpdesk";

export const TICKET_FILTER_OPTIONS = {
  status: [ALL, ...TICKET_STATUSES],
  priority: [ALL, ...TICKET_PRIORITIES],
  assignee: [ALL, ...TICKET_ASSIGNEES],
};

export const DEFAULT_TICKET_FILTERS: TicketFilterState = {
  search: "",
  status: ALL,
  priority: ALL,
  assignee: ALL,
};

/** Applies the search box and the three dimension filters. */
export const filterTickets = (
  tickets: Ticket[],
  { search, status, priority, assignee }: TicketFilterState,
): Ticket[] => {
  const term = search.trim().toLowerCase();

  return tickets.filter(
    (ticket) =>
      (status === ALL || ticket.status === status) &&
      (priority === ALL || ticket.priority === priority) &&
      (assignee === ALL || ticket.assignee === assignee) &&
      (term === "" ||
        `${ticket.id} ${ticket.subject} ${ticket.assignee}`
          .toLowerCase()
          .includes(term)),
  );
};

/** Next reference in the `HD-####` series. */
export const nextTicketId = (tickets: Ticket[]): string => {
  const highest = tickets.reduce((max, ticket) => {
    const number = Number(ticket.id.split("-")[1]);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `HD-${highest + 1}`;
};

/** Today, in the `Jul 30, 2026` format the queue displays. */
export const todayLabel = (): string =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

/** Right now, in the `10:24 AM` format the timeline displays. */
const timeLabel = (): string =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** Applies a change made on the detail screen back to the queue. */
export const updateTicket = (
  ticketId: string,
  patch: Partial<Omit<Ticket, "id">>,
): void => {
  const ticket = TICKETS.find((item) => item.id === ticketId);
  if (!ticket) return;

  Object.assign(ticket, patch, { updated: todayLabel() });
};

/**
 * Files the new ticket into the queue and seeds its detail screen, so a
 * freshly raised ticket opens like any other one.
 */
export const addTicket = (draft: TicketDraft): Ticket => {
  const ticket: Ticket = {
    id: nextTicketId(TICKETS),
    subject: draft.subject,
    status: "Open",
    priority: draft.priority,
    assignee: draft.assignee,
    updated: todayLabel(),
  };

  const created = `${ticket.updated}, ${timeLabel()}`;

  TICKETS.unshift(ticket);

  registerTicketDetail(ticket.id, {
    description:
      draft.description.trim() ||
      `${draft.subject}. Raised through the helpdesk queue and currently sitting with ${draft.assignee}.`,
    attachments: draft.attachments,
    category: draft.category,
    reporter: "Jane Doe",
    created,
    activity: [
      {
        id: `${ticket.id}-1`,
        author: "Jane Doe",
        action: "created ticket",
        timestamp: created,
      },
    ],
  });

  return ticket;
};
