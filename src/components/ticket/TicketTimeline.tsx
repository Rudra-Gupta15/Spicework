import { Avatar } from "@/components/ui";
import type { TicketActivity } from "@/types/ticket";

interface TicketTimelineProps {
  /** Chronological entries — the newest is rendered first. */
  entries: TicketActivity[];
}

export const TicketTimeline = ({ entries }: TicketTimelineProps) => {
  const ordered = [...entries].reverse();

  return (
    <ol className="space-y-5">
      {ordered.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-3">
          {/* Connector down to the next avatar. */}
          {index < ordered.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-10 bottom-[-24px] left-[17px] w-px bg-line"
            />
          )}

          <Avatar name={entry.author} size="md" variant="auto" />

          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-semibold text-heading">{entry.author}</span>{" "}
              <span className="text-muted">{entry.action}</span>{" "}
              <span className="text-muted">• {entry.timestamp}</span>
            </p>

            {entry.body && (
              <p className="mt-2 rounded-lg border border-line bg-navy-50 px-4 py-3 text-sm leading-relaxed text-heading">
                {entry.body}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};
