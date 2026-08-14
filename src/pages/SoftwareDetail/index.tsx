import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { AppsTable } from "@/components/software/AppsTable";
import { LoginTab } from "@/components/software/LoginTab";
import { UserTab } from "@/components/software/UserTab";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui";
import { HARDWARE_DEVICES } from "@/data/hardware";
import { getDeviceUsers } from "@/data/hardwareUsers";
import { getDeviceApps } from "@/data/softwareApps";
import {
  SOFTWARE_TABS,
  getDeviceLogins,
  type SoftwareTab,
} from "@/data/softwareDetail";

const SOFTWARE_ROUTE = "/inventory/software";

const SoftwareDetailPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SoftwareTab>("Login");

  const device = useMemo(
    () => HARDWARE_DEVICES.find((item) => item.id === deviceId),
    [deviceId],
  );

  const logins = useMemo(
    () => (device ? getDeviceLogins(device) : []),
    [device],
  );

  const users = useMemo(
    () => (device ? getDeviceUsers(device) : []),
    [device],
  );

  const apps = useMemo(() => (device ? getDeviceApps(device) : []), [device]);

  /* Deep link to a device that is not in the current data set. */
  if (!device) return <Navigate to={SOFTWARE_ROUTE} replace />;

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
        {tab === "Login" && <LoginTab logins={logins} />}
        {tab === "User" && <UserTab users={users} />}
        {tab === "Software" && <AppsTable apps={apps} />}
      </div>
    </>
  );
};

export default SoftwareDetailPage;
