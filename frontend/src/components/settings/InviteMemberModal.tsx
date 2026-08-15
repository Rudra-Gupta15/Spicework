import { useState } from "react";

import { Button, Field, Input, Modal, Select, Toggle } from "@/components/ui";
import {
  ADMIN_ROLE_OPTIONS,
  ORGANIZATION,
  findSiteByName,
  siteOptions,
} from "@/data/admin";
import type { AdminUserDraft } from "@/data/admin";

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (draft: AdminUserDraft) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Invite Team Member" dialog. Mounted only while open, so each run starts
 * from an empty form. The person is placed at one of the organization's
 * sites — the same set the Sites screen manages, never a free-text
 * department that nothing else knows about.
 */
export const InviteMemberModal = ({
  onClose,
  onInvite,
}: InviteMemberModalProps) => {
  const sites = siteOptions();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Technician");
  const [site, setSite] = useState(sites[0] ?? "");
  const [welcome, setWelcome] = useState(true);
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    site?: string;
  }>({});

  const submit = () => {
    const next: typeof errors = {};

    if (!name.trim()) next.name = "Enter the member's full name.";
    if (!email.trim()) next.email = "Enter an email address.";
    else if (!EMAIL_PATTERN.test(email.trim()))
      next.email = "Enter a valid email address.";

    const chosen = findSiteByName(site);
    if (!chosen) next.site = "Pick the site this person works from.";

    setErrors(next);
    if (Object.keys(next).length > 0 || !chosen) return;

    onInvite({
      name: name.trim(),
      email: email.trim(),
      role,
      siteId: chosen.id,
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Invite Team Member"
      description={`Send an invitation to join ${ORGANIZATION.name}.`}
      variant="plain"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit}>
            Send Invitation
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Email Address" htmlFor="invite-email" error={errors.email}>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((c) => ({ ...c, email: undefined }));
            }}
            placeholder="e.g. priya.sharma@prevoyancesolutions.com"
            error={errors.email}
          />
        </Field>

        <Field label="Full Name" htmlFor="invite-name" error={errors.name}>
          <Input
            id="invite-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((c) => ({ ...c, name: undefined }));
            }}
            placeholder="e.g. Priya Sharma"
            error={errors.name}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Role" htmlFor="invite-role">
            <Select
              id="invite-role"
              size="lg"
              fullWidth
              options={ADMIN_ROLE_OPTIONS}
              value={role}
              onChange={setRole}
              aria-label="Role"
            />
          </Field>

          <Field label="Site" htmlFor="invite-site" error={errors.site}>
            <Select
              id="invite-site"
              size="lg"
              fullWidth
              align="right"
              options={sites}
              value={site}
              onChange={setSite}
              placeholder="Select Site..."
              aria-label="Site"
              error={errors.site !== undefined}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading">
              Send Welcome Email
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              Send setup instructions and access credentials instantly
            </p>
          </div>
          <Toggle
            checked={welcome}
            onChange={setWelcome}
            label="Send Welcome Email"
            hideLabel
          />
        </div>
      </div>
    </Modal>
  );
};
