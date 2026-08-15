import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { ConfirmTicketModal } from "@/components/ticket/ConfirmTicketModal";
import { FileDropzone } from "@/components/ticket/FileDropzone";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  AUTO_ASSIGN,
  TICKET_ASSIGNEE_OPTIONS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKETS,
  addTicket,
  nextTicketId,
  teamForCategory,
} from "@/data/tickets";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { AttachedFile, TicketPriority } from "@/types/ticket";

const TICKET_ROUTE = "/inventory/ticket";

/** Dot shown in the priority trigger, matching the queue's colours. */
const PRIORITY_DOTS: Record<string, string> = {
  Critical: "bg-status-offline",
  High: "bg-status-offline",
  Medium: "bg-status-maintenance",
  Low: "bg-status-info",
};

const TicketCreatePage = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState(AUTO_ASSIGN);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  /* Submit stays disabled until every required field is filled. */
  const isComplete =
    subject.trim() !== "" &&
    description.trim() !== "" &&
    category !== "" &&
    priority !== "";

  const confirm = useDisclosure();

  const submit = useCallback(() => {
    const ticket = addTicket({
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority: priority as TicketPriority,
      /* "Auto-assign" routes the ticket by its category. */
      assignee:
        assignee === AUTO_ASSIGN ? teamForCategory(category) : assignee,
      attachments: attachments.map((file) => file.name),
    });

    confirm.close();
    navigate(`${TICKET_ROUTE}/${ticket.id}/created`, { replace: true });
  }, [
    subject,
    description,
    category,
    priority,
    assignee,
    attachments,
    confirm,
    navigate,
  ]);

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-64">
          <nav
            aria-label="Breadcrumb"
            className="text-[13px] font-medium text-heading"
          >
            <Link
              to={TICKET_ROUTE}
              className="transition-colors hover:text-brand"
            >
              Help Desk
            </Link>
            <span className="mx-1.5 text-muted">&gt;</span>
            <span aria-current="page">Create Ticket</span>
          </nav>

          <h1 className="mt-1 text-[22px] leading-tight font-bold text-heading sm:text-[26px]">
            Create New Ticket
          </h1>
        </div>

        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
          onClick={() => navigate(TICKET_ROUTE)}
          className="shrink-0"
        >
          Back
        </Button>
      </header>

      <Card className="mt-6 px-6 py-6">
        <div className="space-y-5">
          <Field label="Subject" htmlFor="ticket-subject" required>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g., Cannot connect to printer, slow network"
            />
          </Field>

          <Field label="Description" htmlFor="ticket-description" required>
            <Textarea
              id="ticket-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Please provide details about the issue..."
              rows={5}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Category" htmlFor="ticket-category" required>
              <Select
                id="ticket-category"
                size="lg"
                fullWidth
                options={TICKET_CATEGORIES}
                value={category}
                onChange={setCategory}
                placeholder="Select Category..."
                aria-label="Category"
              />
            </Field>

            <Field label="Priority" htmlFor="ticket-priority" required>
              <Select
                id="ticket-priority"
                size="lg"
                fullWidth
                options={TICKET_PRIORITIES}
                value={priority}
                onChange={setPriority}
                placeholder="Select Priority..."
                aria-label="Priority"
                leading={
                  priority ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        PRIORITY_DOTS[priority],
                      )}
                    />
                  ) : null
                }
              />
            </Field>

            <Field label="Assignee" htmlFor="ticket-assignee">
              <Select
                id="ticket-assignee"
                size="lg"
                fullWidth
                align="right"
                options={TICKET_ASSIGNEE_OPTIONS}
                value={assignee}
                onChange={setAssignee}
                placeholder="Select Assignee..."
                aria-label="Assignee"
              />
            </Field>
          </div>

          <Field label="Attachments">
            <FileDropzone files={attachments} onChange={setAttachments} />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
          <Button
            variant="outlinePrimary"
            size="lg"
            onClick={() => navigate(TICKET_ROUTE)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={!isComplete}
            onClick={confirm.open}
          >
            Submit Ticket
          </Button>
        </div>
      </Card>

      <ConfirmTicketModal
        isOpen={confirm.isOpen}
        ticketId={nextTicketId(TICKETS)}
        draft={{
          subject: subject.trim(),
          priority: priority as TicketPriority,
          category,
          assignee,
        }}
        onEdit={confirm.close}
        onConfirm={submit}
      />
    </>
  );
};

export default TicketCreatePage;
