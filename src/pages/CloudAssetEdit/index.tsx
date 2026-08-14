import { useCallback, useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { CloudServiceForm } from "@/components/cloud/CloudServiceForm";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui";
import { CLOUD_SERVICES } from "@/data/cloudAssets";
import { getServiceDetail } from "@/data/cloudDetail";
import { toFormValues } from "@/data/cloudForm";

const CLOUD_ROUTE = "/inventory/cloud-assets";

const CloudAssetEditPage = () => {
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

  const initialValues = useMemo(
    () => (service && detail ? toFormValues(service, detail) : null),
    [service, detail],
  );

  /* Both actions return to the record the form was opened from. */
  const close = useCallback(
    () => navigate(`${CLOUD_ROUTE}/${serviceId}`),
    [navigate, serviceId],
  );

  /* Deep link to a service that is not in the current data set. */
  if (!service || !initialValues) return <Navigate to={CLOUD_ROUTE} replace />;

  return (
    <>
      <Navbar
        title="Edit Cloud Service Configuration"
        subtitle={`Update the subscription terms, ownership and access records tracked for ${service.name}.`}
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
            onClick={close}
          >
            Back
          </Button>
        }
      />

      <div className="mt-6">
        <CloudServiceForm
          initialValues={initialValues}
          submitLabel="Verify & Save Cloud Asset"
          onSubmit={close}
          onCancel={close}
        />
      </div>
    </>
  );
};

export default CloudAssetEditPage;
