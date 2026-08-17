import { useCallback, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Clock, Paperclip } from "lucide-react";

import { PanelCard } from "@/components/ticket/PanelCard";
import { TicketInfoCard } from "@/components/ticket/TicketInfoCard";
import { TicketFeedbackCard } from "@/components/ticket/TicketFeedbackCard";
import { TicketStatusBanner } from "@/components/ticket/TicketStatusBanner";
import { TicketTimeline } from "@/components/ticket/TicketTimeline";
import { Button, Textarea } from "@/components/ui";
import { CURRENT_COMPANY } from "@/config/company";
import { TICKETS, todayLabel, updateTicket } from "@/data/tickets";
import {
  addTicketActivity,
  getTicketDetail,
  setTicketFeedback,
} from "@/data/ticketDetail";
import type { TicketActivity, TicketStatus } from "@/types/ticket";

const TICKET_ROUTE = "/inventory/ticket";

const TicketDetailPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const ticket = useMemo(
    () => TICKETS.find((item) => item.id === ticketId),
    [ticketId],
  );

  const detail = useMemo(
    () => (ticket ? getTicketDetail(ticket) : null),
    [ticket],
  );

  const [activity, setActivity] = useState<TicketActivity[]>(
    detail?.activity ?? [],
  );
  /* Status lives here too, so the info card reflects the update at once. */
  const [status, setStatus] = useState<TicketStatus | undefined>(
    ticket?.status,
  );
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState(detail?.feedback);

  /** Appends timeline entries to both the record and this screen. */
  const log = useCallback(
    (entries: { action: string; body?: string; author?: string }[]) => {
      if (!ticket) return;

      const timestamp = `${todayLabel()}, ${new Date().toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit" },
      )}`;

      setActivity((current) => {
        const added = entries.map((entry, index) => ({
          id: `${ticket.id}-${current.length + index + 1}`,
          timestamp,
          action: entry.action,
          body: entry.body,
          /* Most events are the signed-in account's; feedback is the
             reporter's. */
          author: entry.author ?? CURRENT_COMPANY.name,
        }));

        for (const entry of added) addTicketActivity(ticket.id, entry);
        return [...current, ...added];
      });
    },
    [ticket],
  );

  /** Moves the ticket and records the change in one step. */
  const moveTo = useCallback(
    (next: TicketStatus, action: string, author?: string) => {
      if (!ticket) return;

      updateTicket(ticket.id, { status: next });
      setStatus(next);
      log([{ action, author }]);
    },
    [ticket, log],
  );

  const postComment = useCallback(() => {
    const body = comment.trim();
    if (!body) return;

    /* The first reply takes the ticket off the untouched queue. */
    if (status === "Open") {
      moveTo("In Progress", "changed status to In Progress");
    }

    log([{ action: "posted comment", body }]);
    setComment("");
  }, [comment, status, moveTo, log]);

  const resolve = useCallback(
    () => moveTo("Resolved", "changed status to Resolved"),
    [moveTo],
  );

  const reopen = useCallback(
    () => moveTo("In Progress", "reopened ticket"),
    [moveTo],
  );

  /* Rating the resolution is what finally closes the ticket. */
  const submitFeedback = useCallback(
    (rating: number, comment: string) => {
      if (!ticket || !detail) return;

      const entry = { rating, comment, author: detail.reporter };
      setTicketFeedback(ticket.id, entry);
      setFeedback(entry);

      moveTo(
        "Closed",
        `closed ticket and left a ${rating}-star rating`,
        detail.reporter,
      );
    },
    [ticket, detail, moveTo],
  );

  /* Deep link to a ticket that is not in the current queue. */
  if (!ticket || !detail) return <Navigate to={TICKET_ROUTE} replace />;

  const currentStatus = status ?? ticket.status;
  const isClosedOut = currentStatus === "Resolved" || currentStatus === "Closed";

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-64">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[13px] text-muted"
          >
            <Link
              to={TICKET_ROUTE}
              className="transition-colors hover:text-heading"
            >
              Help Desk
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span aria-current="page">#{ticket.id}</span>
          </nav>

          <h1 className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[22px] leading-tight font-bold">
            <span className="text-brand">#{ticket.id}</span>
            <span className="text-heading">{ticket.subject}</span>
          </h1>
        </div>

        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          Back
        </Button>
      </header>

      {/* Once rated, the survey card takes the banner's place. */}
      {isClosedOut && !feedback && (
        <TicketStatusBanner
          className="mt-5"
          status={currentStatus}
          onReopen={reopen}
        />
      )}

      {isClosedOut && (
        <TicketFeedbackCard
          className="mt-5"
          feedback={feedback}
          reporter={detail.reporter}
          onSubmit={submitFeedback}
        />
      )}

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <PanelCard label="Description">
            <p className="text-[15px] leading-relaxed text-heading">
              {detail.description}
            </p>

            {detail.attachments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {detail.attachments.map((file) => (
                  <li
                    key={file}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <Paperclip
                      className="h-4 w-4 shrink-0"
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                    {file}
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>

          <PanelCard label="Activity Timeline" icon={Clock} divider>
            <TicketTimeline entries={activity} />
          </PanelCard>

          {/* A closed-out ticket takes no more comments until it reopens. */}
          {!isClosedOut && (
            <PanelCard label="Add a Comment">
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a comment..."
                aria-label="Add a comment"
                rows={3}
              />

              <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
                <Button variant="outline" onClick={resolve}>
                  Mark as Resolved
                </Button>
                <Button
                  variant="brand"
                  onClick={postComment}
                  disabled={comment.trim() === ""}
                >
                  Update
                </Button>
              </div>
            </PanelCard>
          )}
        </div>

        <TicketInfoCard
          ticket={{ ...ticket, status: currentStatus }}
          detail={detail}
        />
      </div>
    </>
  );
};

export default TicketDetailPage;
