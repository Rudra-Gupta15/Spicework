import { Badge } from "@/components/ui";
import type { AdminStatus } from "@/types/admin";
import type { Tone } from "@/types/ui";

/** One tone per lifecycle state, shared by all four admin lists. */
const TONES: Record<AdminStatus, Tone> = {
  Active: "success",
  Trial: "info",
  Invited: "warning",
  Suspended: "danger",
};

export const AdminStatusBadge = ({ status }: { status: AdminStatus }) => (
  <Badge tone={TONES[status]}>{status}</Badge>
);
