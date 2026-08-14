import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Boxes, Plus } from "lucide-react";

import { ConnectedDevicesTab } from "@/components/hardware/ConnectedDevicesTab";
import { DetailFieldGrid } from "@/components/hardware/DetailFieldGrid";
import { DetailTabs } from "@/components/common/DetailTabs";
import { NetworkTab } from "@/components/hardware/NetworkTab";
import { PeripheralsTab } from "@/components/hardware/PeripheralsTab";
import { PrintersTab } from "@/components/hardware/PrintersTab";
import { StorageTab } from "@/components/hardware/StorageTab";
import { UsersTab } from "@/components/hardware/UsersTab";
import { VideoTab } from "@/components/hardware/VideoTab";
import { Navbar } from "@/components/layout/Navbar";
import { Button, Card } from "@/components/ui";
import { HARDWARE_DEVICES } from "@/data/hardware";
import {
  DEVICE_TABS,
  getTabPanel,
  type DeviceTab,
} from "@/data/hardwareDetail";
import { getConnectedDevices } from "@/data/hardwareConnected";
import { getDeviceAdapters } from "@/data/hardwareNetwork";
import { getDevicePeripherals } from "@/data/hardwarePeripherals";
import { getDevicePrinters } from "@/data/hardwarePrinters";
import { getDeviceStorage } from "@/data/hardwareStorage";
import { getDeviceUsers } from "@/data/hardwareUsers";
import { getVideoControllers } from "@/data/hardwareVideo";

const HARDWARE_ROUTE = "/inventory/hardware";

const HardwareDetailPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DeviceTab>("Overview");

  const device = useMemo(
    () => HARDWARE_DEVICES.find((item) => item.id === deviceId),
    [deviceId],
  );

  const panel = useMemo(
    () => (device ? getTabPanel(device, tab) : null),
    [device, tab],
  );

  const storage = useMemo(
    () => (device ? getDeviceStorage(device) : null),
    [device],
  );

  const adapters = useMemo(
    () => (device ? getDeviceAdapters(device) : []),
    [device],
  );

  const peripherals = useMemo(
    () => (device ? getDevicePeripherals(device) : []),
    [device],
  );

  const printers = useMemo(
    () => (device ? getDevicePrinters(device) : []),
    [device],
  );

  const connected = useMemo(
    () => (device ? getConnectedDevices(device) : []),
    [device],
  );

  const controllers = useMemo(
    () => (device ? getVideoControllers(device) : []),
    [device],
  );

  const users = useMemo(
    () => (device ? getDeviceUsers(device) : []),
    [device],
  );

  /* Deep link to a device that is not in the current data set. */
  if (!device) return <Navigate to={HARDWARE_ROUTE} replace />;

  /* Tabs with their own card layout render themselves; the rest share the
     single-card shell below. */
  const customPanel =
    tab === "Storage" && storage ? (
      <StorageTab storage={storage} />
    ) : tab === "Network" ? (
      <NetworkTab adapters={adapters} />
    ) : tab === "Peripherals" ? (
      <PeripheralsTab peripherals={peripherals} />
    ) : tab === "Printers" ? (
      <PrintersTab printers={printers} />
    ) : tab === "Connected Devices" ? (
      <ConnectedDevicesTab devices={connected} />
    ) : tab === "Video/GPU" ? (
      <VideoTab controllers={controllers} />
    ) : tab === "Users" ? (
      <UsersTab users={users} />
    ) : null;

  return (
    <>
      <Navbar
        title="Hardware Assets"
        subtitle="Track hardware devices, warranties, and maintenance across your network."
        actions={
          <>
            {/* Raising a ticket belongs to the device as a whole, so it
                only sits on the summary tab. */}
            {tab === "Overview" && (
              <Button
                variant="brand"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate("/inventory/ticket")}
              >
                Create Ticket
              </Button>
            )}
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(HARDWARE_ROUTE)}
            >
              Back
            </Button>
          </>
        }
      />

      <DetailTabs
        tabs={DEVICE_TABS}
        active={tab}
        onChange={setTab}
        className="mt-6"
      />

      {customPanel ? (
        <div className="mt-5">{customPanel}</div>
      ) : (
        <Card className="mt-5 px-5 pt-5 pb-8">
          <h2 className="text-base font-bold text-heading">
            {panel?.title ?? tab}
          </h2>

          <div className="mt-4">
            {panel ? (
              <DetailFieldGrid fields={panel.fields} />
            ) : (
              <div className="grid place-items-center py-16 text-center">
                <Boxes className="h-10 w-10 text-navy-300" strokeWidth={1.5} />
                <p className="mt-4 text-sm text-muted">
                  No {tab.toLowerCase()} details reported for {device.name} yet.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default HardwareDetailPage;
