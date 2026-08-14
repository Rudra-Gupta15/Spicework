import { useState } from "react";
import { Check } from "lucide-react";

import { Button, Card, StarRating, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TicketFeedback } from "@/types/ticket";

interface TicketFeedbackCardProps {
  /** Set once the rating has been left — switches the card to read-only. */
  feedback?: TicketFeedback;
  /** Who the prompt is addressed to, shown after submission. */
  reporter: string;
  onSubmit: (rating: number, comment: string) => void;
  className?: string;
}

/** Satisfaction survey shown once the work on a ticket is finished. */
export const TicketFeedbackCard = ({
  feedback,
  reporter,
  onSubmit,
  className,
}: TicketFeedbackCardProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <Card className={cn("px-5 py-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-heading">
            How was your experience?
          </h2>
          <p className="mt-1 text-sm text-muted">
            {feedback
              ? `Feedback submitted by ${feedback.author}`
              : `Rate the support ${reporter} received on this ticket.`}
          </p>
        </div>

        <StarRating
          value={feedback ? feedback.rating : rating}
          onChange={feedback ? undefined : setRating}
          className="shrink-0"
        />
      </div>

      {feedback ? (
        <>
          {feedback.comment && (
            <p className="mt-4 text-[15px] text-heading">
              &ldquo;{feedback.comment}&rdquo;
            </p>
          )}

          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-signal-600">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.4} />
            Thank you for your feedback
          </p>
        </>
      ) : (
        <>
          <Textarea
            className="mt-4"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tell us how the request was handled (optional)…"
            aria-label="Feedback comment"
            rows={2}
          />

          <div className="mt-3 flex justify-end">
            <Button
              variant="brand"
              disabled={rating === 0}
              onClick={() => onSubmit(rating, comment.trim())}
            >
              Submit Feedback
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
