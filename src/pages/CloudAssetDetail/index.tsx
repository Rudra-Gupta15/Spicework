import { useCallback, useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { CloudSpecCard } from "@/components/cloud/CloudSpecCard";
import { CloudUsageTable } from "@/components/cloud/CloudUsageTable";
import { Navbar } from "@/components/layout/Navbar";
import { Button, SectionCard } from "@/components/ui";
import { CLOUD_SERVICES } from "@/data/cloudAssets";
import { CLOUD_DETAIL_SUBTITLE, getServiceDetail } from "@/data/cloudDetail";

const CLOUD_ROUTE = "/inventory/cloud-assets";

const CloudAssetDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const service = useMemo(
    () => CLOUD_SERVICES.find((item) => item.id === serviceId),
    [serviceId],
  );

  const detail = useMemo(
    () => (service ? getServiceDetail(service) : null),
    [service],
  );

  const openEditor = useCallback(
    () => navigate(`${CLOUD_ROUTE}/${serviceId}/edit`),
    [navigate, serviceId],
  );

  /* Deep link to a service that is not in the current data set. */
  if (!service || !detail) return <Navigate to={CLOUD_ROUTE} replace />;

  return (
    <>
      <Navbar
        title={service.name}
        subtitle={CLOUD_DETAIL_SUBTITLE}
        actions={
          <>
            <Button variant="brand" onClick={openEditor}>
              Edit Configuration
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
              onClick={() => navigate(CLOUD_ROUTE)}
            >
              Back
            </Button>
          </>
        }
      />

      <div className="mt-6 space-y-6">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CloudSpecCard
            title="Subscription Contracts"
            rows={detail.subscription}
          />
          <CloudSpecCard title="Tenant Identity & Owner" rows={detail.tenant} />
        </section>

        <SectionCard title="Usage Breakdown by Organizational Units">
          <CloudUsageTable rows={detail.usage} />
        </SectionCard>
      </div>
    </>
  );
};

export default CloudAssetDetailPage;
