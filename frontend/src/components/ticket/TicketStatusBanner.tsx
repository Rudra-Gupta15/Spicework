import { CircleCheck, CircleSlash } from "lucide-react";

import { cn } from "@/lib/cn";
import type { TicketStatus } from "@/types/ticket";

/** Wording and colour per closed-out status. */
const BANNERS = {
  Resolved: {
    icon: CircleCheck,
    message:
      "This ticket has been resolved. If the issue persists, you can reopen it.",
    card: "border-signal-500 bg-signal-50",
    icon_: "text-signal-600",
    button: "border-signal-500 text-signal-600 hover:bg-signal-100",
  },
  Closed: {
    icon: CircleSlash,
    message: "This ticket is closed. Reopen it to continue the conversation.",
    card: "border-line bg-canvas",
    icon_: "text-muted",
    button: "border-field text-heading hover:bg-navy-50",
  },
} as const;

interface TicketStatusBannerProps {
  status: TicketStatus;
  onReopen: () => void;
  className?: string;
}

/** Resolution notice with the reopen action, above the ticket panels. */
export const TicketStatusBanner = ({
  status,
  onReopen,
  className,
}: TicketStatusBannerProps) => {
  if (status !== "Resolved" && status !== "Closed") return null;

  const banner = BANNERS[status];
  const Icon = banner.icon;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border px-5 py-4",
        banner.card,
        className,
      )}
    >
      <Icon
        className={cn("h-5 w-5 shrink-0", banner.icon_)}
        strokeWidth={2}
        aria-hidden="true"
      />

      <p className="min-w-0 flex-1 text-sm text-heading">{banner.message}</p>

      <button
        type="button"
        onClick={onReopen}
        className={cn(
          "h-10 shrink-0 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
          "focus-visible:ring-2 focus-visible:ring-signal-500/30 focus-visible:outline-none",
          banner.button,
        )}
      >
        Reopen Ticket
      </button>
    </div>
  );
};
