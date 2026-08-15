import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TicketDraft } from "@/types/ticket";

/** Dot colours shared with the queue table. */
const PRIORITY_DOTS: Record<string, string> = {
  Critical: "bg-status-offline",
  High: "bg-status-offline",
  Medium: "bg-status-maintenance",
  Low: "bg-status-info",
};

interface ConfirmTicketModalProps {
  isOpen: boolean;
  /** Reference the ticket will be filed under. */
  ticketId: string;
  draft: Pick<TicketDraft, "subject" | "priority" | "category" | "assignee">;
  /** Closes the dialog and returns to the form. */
  onEdit: () => void;
  onConfirm: () => void;
}

const Cell = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="text-[13px] text-muted">{label}</p>
    <div className="mt-1 font-semibold text-heading">{children}</div>
  </div>
);

/** Read-back of the draft, shown before it joins the help desk queue. */
export const ConfirmTicketModal = ({
  isOpen,
  ticketId,
  draft,
  onEdit,
  onConfirm,
}: ConfirmTicketModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onEdit}
    title="Confirm Ticket Details"
    description="Please verify the ticket information below before submitting to the help desk queue."
    variant="plain"
    size="md"
    footer={
      <>
        <Button variant="outlinePrimary" onClick={onEdit}>
          Edit Ticket
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm &amp; Submit
        </Button>
      </>
    }
  >
    <div className="rounded-lg border border-line bg-canvas px-4 py-3.5">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <p className="text-[13px] text-muted">Ticket ID</p>
        <p className="font-semibold text-brand">#{ticketId}</p>
      </div>

      <div className="border-b border-line py-3">
        <Cell label="Subject">{draft.subject}</Cell>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-3 sm:grid-cols-3">
        <Cell label="Priority">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                PRIORITY_DOTS[draft.priority],
              )}
            />
            {draft.priority}
          </span>
        </Cell>

        <Cell label="Category">{draft.category}</Cell>
        <Cell label="Assignee">{draft.assignee}</Cell>
      </div>
    </div>
  </Modal>
);
