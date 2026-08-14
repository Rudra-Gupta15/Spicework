/** Who produced a log entry — a person or the scanner. */
export type LogAuthorKind = "user" | "automated";

/** One entry in the device activity log. */
export interface LogEntry {
  id: string;
  author: string;
  kind: LogAuthorKind;
  /** Relative or absolute time, already formatted for display. */
  timestamp: string;
  message: string;
  /** Set when the note carries an image attachment. */
  hasImage?: boolean;
  /** Pinned by the reader for quick recall. */
  bookmarked?: boolean;
}
