import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { DeviceHardware } from "@/components/log/DeviceHardware";
import { DeviceNetwork } from "@/components/log/DeviceNetwork";
import { DeviceOverview } from "@/components/log/DeviceOverview";
import { DeviceSoftware } from "@/components/log/DeviceSoftware";
import { DeviceTickets } from "@/components/log/DeviceTickets";
import { LogHistory } from "@/components/log/LogHistory";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui";
import { DEVICE_LOG_TABS, type DeviceLogTab } from "@/data/deviceLog";

const LogPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DeviceLogTab>("Overview");

  return (
    <>
      <Navbar
        title="Device Log"
        subtitle="Track historical changes, system diagnostics, automated asset updates, and technical annotations."
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <DetailTabs tabs={DEVICE_LOG_TABS} active={tab} onChange={setTab} />

        {tab === "Overview" && <DeviceOverview />}
        {tab === "Hardware" && <DeviceHardware />}
        {tab === "Software" && <DeviceSoftware />}
        {tab === "Network" && <DeviceNetwork />}
        {tab === "Tickets" && <DeviceTickets />}
        {tab === "History" && <LogHistory />}
      </div>
    </>
  );
};

export default LogPage;
