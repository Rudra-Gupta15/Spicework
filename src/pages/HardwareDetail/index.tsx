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
import { Button, Card, Loader } from "@/components/ui";
import {
  mapHardwareFields,
  mapNetworkAdapters,
  mapOverviewFields,
  mapPeripherals,
  mapPrinters,
  mapStorage,
  mapUsers,
  mapVideoControllers,
  useDeviceDetail,
} from "@/data/deviceApi";
import { DEVICE_TABS, type DeviceTab } from "@/data/hardwareDetail";
import { getConnectedDevices } from "@/data/hardwareConnected";
import type { HardwareDevice } from "@/types/hardware";

const HARDWARE_ROUTE = "/inventory/hardware";

const HardwareDetailPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DeviceTab>("Overview");

  const { detail, asset, isLoading, error } = useDeviceDetail(deviceId ?? "");

  /* "Connected Devices" has no backing data in the single-tenant audit
     flow — it's specific to the newer multi-tenant network-scan feature —
     so it's the one tab still on the old mock lookup, keyed by this
     stand-in. A real device id won't match its mock keys, so it correctly
     falls back to an empty list rather than showing invented data. */
  const legacyDeviceStub: HardwareDevice = useMemo(
    () => ({
      id: deviceId ?? "",
      name: detail?.computer_name ?? deviceId ?? "",
      type: "Computer",
      manufacturer: detail?.hardware_details?.manufacturer || "Unknown",
      serialNumber: detail?.hardware_details?.serial_number || "Unknown",
      status: "ONLINE",
      lastScan: detail?.last_audit || "Unknown",
      ipAddress: detail?.network_details?.[0]?.ip_address || "—",
      osVersion: detail?.os_name || "Unknown",
      location: "Unknown",
      assignedTo: asset?.owner || detail?.current_user || "Unassigned",
    }),
    [deviceId, detail, asset],
  );

  const overviewFields = useMemo(
    () => (detail ? mapOverviewFields(detail, asset) : []),
    [detail, asset],
  );
  const hardwareFields = useMemo(
    () => (detail ? mapHardwareFields(detail) : []),
    [detail],
  );
  const users = useMemo(() => mapUsers(detail), [detail]);
  const storage = useMemo(() => mapStorage(detail), [detail]);
  const adapters = useMemo(() => mapNetworkAdapters(detail), [detail]);
  const peripherals = useMemo(() => mapPeripherals(detail), [detail]);
  const printers = useMemo(() => mapPrinters(detail), [detail]);
  const controllers = useMemo(() => mapVideoControllers(detail), [detail]);
  const connected = useMemo(() => getConnectedDevices(legacyDeviceStub), [legacyDeviceStub]);

  /* No device id in the URL at all. */
  if (!deviceId) return <Navigate to={HARDWARE_ROUTE} replace />;

  if (error) {
    return (
      <>
        <Navbar
          title="Hardware Assets"
          actions={
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(HARDWARE_ROUTE)}
            >
              Back
            </Button>
          }
        />
        <Card className="mt-5 p-8 text-center">
          <p className="text-sm text-status-offline">{error}</p>
        </Card>
      </>
    );
  }

  const panel =
    tab === "Overview"
      ? { title: "Overview", fields: overviewFields }
      : tab === "Hardware"
        ? { title: "Hardware Details", fields: hardwareFields }
        : null;

  const customPanel =
    tab === "Storage" ? (
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
            {tab === "Overview" && (
              <Button
                variant="brand"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate("/inventory/ticket/new")}
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

      {isLoading ? (
        <Card className="mt-5 p-8">
          <Loader label="Loading device details…" />
        </Card>
      ) : customPanel ? (
        <div className="mt-5">{customPanel}</div>
      ) : (
        <Card className="mt-5 px-5 pt-5 pb-8">
          <h2 className="text-base font-bold text-heading">
            {panel?.title ?? tab}
          </h2>

          <div className="mt-4">
            {panel && panel.fields.length > 0 ? (
              <DetailFieldGrid fields={panel.fields} />
            ) : (
              <div className="grid place-items-center py-16 text-center">
                <Boxes className="h-10 w-10 text-navy-300" strokeWidth={1.5} />
                <p className="mt-4 text-sm text-muted">
                  No {tab.toLowerCase()} details reported for{" "}
                  {legacyDeviceStub.name} yet.
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
