/** Where a ticket sits in the helpdesk workflow. */
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

/** Impact rating used to order the queue. */
export type TicketPriority = "Critical" | "High" | "Medium" | "Low";

/** One helpdesk ticket in the queue. */
export interface Ticket {
  /** Display reference, e.g. `HD-4892`. */
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  /** Person or team the ticket sits with. */
  assignee: string;
  /** Last activity, already formatted for display. */
  updated: string;
}

/** Active values of the ticket filter bar. */
export interface TicketFilterState {
  search: string;
  status: string;
  priority: string;
  assignee: string;
}

/** One entry in a ticket's activity timeline. */
export interface TicketActivity {
  id: string;
  author: string;
  /** What the author did, e.g. "created ticket" or "commented". */
  action: string;
  /** Timestamp, already formatted for display. */
  timestamp: string;
  /** Comment body, when the entry carries one. */
  body?: string;
}

/** Satisfaction rating left by the reporter once the work is done. */
export interface TicketFeedback {
  /** Stars out of five. */
  rating: number;
  comment: string;
  /** Who rated the ticket — normally the reporter. */
  author: string;
}

/** Everything the ticket detail screen renders. */
export interface TicketDetail {
  description: string;
  /** File names attached to the request. */
  attachments: string[];
  category: string;
  reporter: string;
  created: string;
  activity: TicketActivity[];
  /** Set once the reporter has rated the resolution. */
  feedback?: TicketFeedback;
}

/** File picked in the attachments dropzone, before upload. */
export interface AttachedFile {
  name: string;
  /** Size in bytes, as reported by the browser. */
  size: number;
}

/** Fields captured by the "Create New Ticket" screen. */
export interface TicketDraft {
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  assignee: string;
  /** File names picked in the attachments dropzone. */
  attachments: string[];
}
