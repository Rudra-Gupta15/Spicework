import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import {
  ADMIN_INDUSTRY_OPTIONS,
  ADMIN_STATUS_VALUES,
  ORGANIZATION,
  updateOrganization,
} from "@/data/admin";
import type { AdminStatus } from "@/types/admin";

const ORGANIZATION_ROUTE = "/dashboard/organization";

/**
 * Edits the one organization. There is no "new organization" counterpart —
 * the tenant already exists by the time anybody signs in, so this screen only
 * ever changes what is already there.
 */
const AdminOrganizationEditPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState(ORGANIZATION.name);
  const [industry, setIndustry] = useState(ORGANIZATION.industry);
  const [status, setStatus] = useState<AdminStatus>(ORGANIZATION.status);
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    name: name.trim() === "" ? "The organization needs a name." : "",
    industry: industry === "" ? "Pick an industry." : "",
  };

  const isComplete = Object.values(errors).every((message) => message === "");

  const submit = useCallback(() => {
    if (!isComplete) {
      setShowErrors(true);
      return;
    }

    updateOrganization({ name: name.trim(), industry, status });
    navigate(ORGANIZATION_ROUTE, { replace: true });
  }, [isComplete, name, industry, status, navigate]);

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: ORGANIZATION.name, to: ORGANIZATION_ROUTE },
          { label: "Edit" },
        ]}
        title="Edit Organization"
        subtitle="Change how the organization is named and classified. Its sites and people stay attached."
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
            onClick={() => navigate(ORGANIZATION_ROUTE)}
          >
            Back
          </Button>
        }
      />

      <Card className="mt-6 px-6 py-6">
        <div className="space-y-5">
          <Field
            label="Organization Name"
            htmlFor="organization-name"
            required
            error={showErrors ? errors.name : undefined}
          >
            <Input
              id="organization-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Prevoyance IT Solutions"
              error={showErrors ? errors.name : undefined}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Industry"
              htmlFor="organization-industry"
              required
              error={showErrors ? errors.industry : undefined}
            >
              <Select
                id="organization-industry"
                size="lg"
                fullWidth
                options={ADMIN_INDUSTRY_OPTIONS}
                value={industry}
                onChange={setIndustry}
                placeholder="Select Industry..."
                aria-label="Industry"
                error={showErrors && errors.industry !== ""}
              />
            </Field>

            <Field label="Status" htmlFor="organization-status">
              <Select
                id="organization-status"
                size="lg"
                fullWidth
                align="right"
                options={ADMIN_STATUS_VALUES}
                value={status}
                onChange={(value) => setStatus(value as AdminStatus)}
                aria-label="Status"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
          <Button
            variant="outlinePrimary"
            size="lg"
            onClick={() => navigate(ORGANIZATION_ROUTE)}
          >
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={submit}>
            Save Changes
          </Button>
        </div>
      </Card>
    </>
  );
};

export default AdminOrganizationEditPage;
