import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { AdminFieldGrid, type AdminField } from "@/components/admin/AdminFieldGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button, Card } from "@/components/ui";
import { ADMIN_SITES, ORGANIZATION, primarySite } from "@/data/admin";

const ORGANIZATION_ROUTE = "/dashboard/organization";
const SITES_ROUTE = "/dashboard/sites";

/**
 * The organization this install belongs to. There is only ever one, so this
 * is a profile screen rather than a row in a list — it is reached from the
 * dashboard, never picked from a set. The counts live on the dashboard it is
 * opened from, so they are not repeated here.
 */
const AdminOrganizationPage = () => {
  const navigate = useNavigate();

  const fields = useMemo<AdminField[]>(() => {
    const primary = primarySite();

    return [
      { key: "name", label: "Organization", value: ORGANIZATION.name },
      { key: "industry", label: "Industry", value: ORGANIZATION.industry },
      {
        key: "status",
        label: "Status",
        value: <AdminStatusBadge status={ORGANIZATION.status} />,
      },
      {
        key: "primary",
        label: "Registered Address",
        /* The full postal address, not the site's nickname — this is what
           goes on a bill or a legal notice. */
        value: primary
          ? `${primary.addressLine}, ${primary.location} ${primary.postalCode}`.trim()
          : "Not set",
      },
      { key: "created", label: "Created On", value: ORGANIZATION.createdOn },
      { key: "id", label: "Organization ID", value: ORGANIZATION.id },
    ];
  }, []);

  return (
    <>
      <AdminPageHeader
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Organization" },
        ]}
        title={ORGANIZATION.name}
        subtitle={`${ORGANIZATION.industry} · operating from ${ADMIN_SITES.length} sites`}
        actions={
          <>
            <Button
              variant="brand"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={2.2} />}
              onClick={() => navigate(`${SITES_ROUTE}/new`)}
            >
              Add Site
            </Button>
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" strokeWidth={2.2} />}
              onClick={() => navigate(`${ORGANIZATION_ROUTE}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </>
        }
      />

      <Card className="mt-6 px-5 py-5">
        <h2 className="text-base font-bold text-heading">
          Organization Details
        </h2>
        <div className="mt-4">
          <AdminFieldGrid fields={fields} />
        </div>
      </Card>
    </>
  );
};

export default AdminOrganizationPage;
