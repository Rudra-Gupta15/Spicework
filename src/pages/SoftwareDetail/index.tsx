import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { AppsTable } from "@/components/software/AppsTable";
import { LoginTab } from "@/components/software/LoginTab";
import { UserTab } from "@/components/software/UserTab";
import { Navbar } from "@/components/layout/Navbar";
import { Button, Card, Loader } from "@/components/ui";
import { mapApps, mapLogins, mapUsers, useDeviceDetail } from "@/data/deviceApi";
import { SOFTWARE_TABS, type SoftwareTab } from "@/data/softwareDetail";

const SOFTWARE_ROUTE = "/inventory/software";

const SoftwareDetailPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SoftwareTab>("Login");

  const { detail, isLoading, error } = useDeviceDetail(deviceId ?? "");

  const logins = useMemo(() => mapLogins(detail), [detail]);
  const users = useMemo(() => mapUsers(detail), [detail]);
  const apps = useMemo(() => mapApps(detail), [detail]);

  if (!deviceId) return <Navigate to={SOFTWARE_ROUTE} replace />;

  return (
    <>
      <Navbar
        title="Software"
        subtitle="Track software applications, licenses, and installations across your network."
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(SOFTWARE_ROUTE)}
          >
            Back
          </Button>
        }
      />

      <DetailTabs
        tabs={SOFTWARE_TABS}
        active={tab}
        onChange={setTab}
        className="mt-6"
      />

      <div className="mt-5">
        {error && (
          <Card className="p-8 text-center">
            <p className="text-sm text-status-offline">{error}</p>
          </Card>
        )}
        {!error && isLoading && (
          <Card className="p-8">
            <Loader label="Loading device details…" />
          </Card>
        )}
        {!error && !isLoading && (
          <>
            {tab === "Login" && <LoginTab logins={logins} />}
            {tab === "User" && <UserTab users={users} />}
            {tab === "Software" && <AppsTable apps={apps} />}
          </>
        )}
      </div>
    </>
  );
};

export default SoftwareDetailPage;
