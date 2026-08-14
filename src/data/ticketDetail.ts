import type {
  Ticket,
  TicketActivity,
  TicketDetail,
  TicketFeedback,
} from "@/types/ticket";

/** Mock data — swap these exports for API responses later. */

const DETAILS: Record<string, TicketDetail> = {
  "HD-4892": {
    description:
      "Remote employees are reporting absolute failure when trying to connect via AnyConnect client. Getting error code 442: gateway unreachable. This is blocking approximately 15 developers working from home.",
    attachments: ["vpn-error-log.txt"],
    category: "Network",
    reporter: "Avinash Kumar",
    created: "Jul 30, 2026, 10:24 AM",
    activity: [
      {
        id: "HD-4892-1",
        author: "Avinash Kumar",
        action: "created ticket",
        timestamp: "Jul 30, 2026, 10:24 AM",
      },
    ],
  },

  "HD-4889": {
    description:
      "The trackpad on the loaner MacBook Pro stops responding after waking from sleep. A restart brings it back for an hour or two before it happens again.",
    attachments: ["console-diagnostics.zip"],
    category: "Hardware",
    reporter: "Priya Nair",
    created: "Jul 29, 2026, 04:10 PM",
    activity: [
      {
        id: "HD-4889-1",
        author: "Priya Nair",
        action: "created ticket",
        timestamp: "Jul 29, 2026, 04:10 PM",
      },
      {
        id: "HD-4889-2",
        author: "Jane Doe",
        action: "commented",
        timestamp: "Jul 30, 2026, 09:02 AM",
        body: "Booked a bench slot for tomorrow morning — please drop the unit at the IT desk.",
      },
    ],
  },

  "HD-4885": {
    description:
      "Wi-Fi on the 2nd floor drops for 30-60 seconds several times an hour. Meeting rooms 2A and 2C are worst affected during stand-ups.",
    attachments: ["ap-signal-survey.pdf"],
    category: "Network",
    reporter: "Rahul Shetty",
    created: "Jul 28, 2026, 11:47 AM",
    activity: [
      {
        id: "HD-4885-1",
        author: "Rahul Shetty",
        action: "created ticket",
        timestamp: "Jul 28, 2026, 11:47 AM",
      },
    ],
  },
};

/** Category guessed from the subject, for tickets without seeded detail. */
export const categoryForSubject = (subject: string): string => {
  const text = subject.toLowerCase();

  if (/wi-?fi|vpn|network|dns|sso/.test(text)) return "Network";
  if (/laptop|printer|monitor|battery|trackpad|hardware/.test(text)) {
    return "Hardware";
  }
  if (/licen|subscription|billing|cost|renewal/.test(text)) return "Billing";
  if (/phishing|antivirus|password|security/.test(text)) return "Security";

  return "General";
};

/** Detail panels for a ticket — generated when none was seeded. */
export const getTicketDetail = (ticket: Ticket): TicketDetail => {
  const seeded = DETAILS[ticket.id];
  if (seeded) return seeded;

  const created = `${ticket.updated}, 09:00 AM`;

  const generated: TicketDetail = {
    description: `${ticket.subject}. Raised through the helpdesk queue and currently sitting with ${ticket.assignee}.`,
    attachments: [],
    category: categoryForSubject(ticket.subject),
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
  };

  DETAILS[ticket.id] = generated;
  return generated;
};

/** Records the detail captured by the "Create Ticket" dialog. */
export const registerTicketDetail = (
  ticketId: string,
  detail: TicketDetail,
): void => {
  DETAILS[ticketId] = detail;
};

/** Stores the reporter's rating against the ticket. */
export const setTicketFeedback = (
  ticketId: string,
  feedback: TicketFeedback,
): void => {
  const detail = DETAILS[ticketId];
  if (detail) detail.feedback = feedback;
};

/** Appends a timeline entry, so it survives leaving and reopening the page. */
export const addTicketActivity = (
  ticketId: string,
  entry: TicketActivity,
): void => {
  DETAILS[ticketId]?.activity.push(entry);
};
