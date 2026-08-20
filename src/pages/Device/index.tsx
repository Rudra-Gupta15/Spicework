import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { AddDeviceModal } from "@/components/device/AddDeviceModal";
import { AssignHistoryModal } from "@/components/device/AssignHistoryModal";
import { DeviceInventoryTable } from "@/components/device/DeviceInventoryTable";
import { DeviceTypeTabs } from "@/components/device/DeviceTypeTabs";
import { Navbar } from "@/components/layout/Navbar";
import { Button, Card, Pagination, Select } from "@/components/ui";
import {
  DEVICE_ASSIGNMENT_FILTERS,
  DEVICE_CATEGORIES,
  DEVICE_SEED,
  createDevice,
  devicesInCategory,
} from "@/data/deviceInventory";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useToast } from "@/hooks/useToast";
import type {
  DeviceAssignmentFilter,
  DeviceCategory,
  DeviceDraft,
  DeviceRecord,
} from "@/types/device";

const PAGE_SIZE = 6;

/**
 * Registered devices, one tab per kind. Each tab is the same table over its
 * own rows: what the unit is, how it is identified, when it was bought and
 * who is holding it — with the hand-off trail a click away.
 */
const DevicePage = () => {
  const toast = useToast();
  const [devices, setDevices] = useState<DeviceRecord[]>(DEVICE_SEED);
  const [category, setCategory] = useState<DeviceCategory>("Laptop");
  /* Narrows the open tab to what is out with someone, or still in store. */
  const [assignment, setAssignment] = useState<DeviceAssignmentFilter>("All");
  const [page, setPage] = useState(1);
  /* The row whose history is open — `null` while the dialog is closed. */
  const [historyFor, setHistoryFor] = useState<DeviceRecord | null>(null);
  const addDevice = useDisclosure();

  const meta = useMemo(
    () =>
      DEVICE_CATEGORIES.find((entry) => entry.id === category) ??
      DEVICE_CATEGORIES[0],
    [category],
  );

  const rows = useMemo(
    () => devicesInCategory(devices, category, assignment),
    [devices, category, assignment],
  );

  const visible = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  /* Switching tabs starts at the top of the new list rather than landing on
     a page number that only made sense for the previous one. */
  const handleCategoryChange = useCallback((next: DeviceCategory) => {
    setCategory(next);
    setPage(1);
  }, []);

  /* The filter carries across tabs — narrowing to unassigned laptops and then
     checking the desktops is the same question asked twice. */
  const handleAssignmentChange = useCallback((next: string) => {
    setAssignment(next as DeviceAssignmentFilter);
    setPage(1);
  }, []);

  const takenSerials = useMemo(
    () => devices.map((device) => device.serialNumber.toLowerCase()),
    [devices],
  );

  /* A new unit goes to the top of its own tab, and the view follows it
     there — adding a printer from the Laptop tab shouldn't look like a
     no-op. */
  const handleAdd = useCallback(
    (draft: DeviceDraft) => {
      const device = createDevice(draft);

      setDevices((current) => [device, ...current]);
      setCategory(device.category);
      /* A narrowed list could hide the unit that was just registered, so the
         filter is dropped rather than leaving the add looking like a no-op. */
      setAssignment("All");
      setPage(1);
      addDevice.close();

      toast({
        tone: "success",
        title: "Device added",
        description: `${device.name} · ${device.serialNumber}`,
      });
    },
    [addDevice, toast],
  );

  return (
    <>
      <Navbar />

      <div className="mt-6 space-y-5">
        {/* Tabs and the actions share one rule, so the underline of the
            active tab sits on the same line the header ends on. */}
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-line">
          <DeviceTypeTabs value={category} onChange={handleCategoryChange} />

          <div className="mb-2 flex items-center gap-2">
            <Select
              label="Assignment:"
              options={DEVICE_ASSIGNMENT_FILTERS}
              value={assignment}
              onChange={handleAssignmentChange}
              align="right"
              aria-label="Filter by assignment"
            />

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
              onClick={addDevice.open}
            >
              Add
            </Button>
          </div>
        </div>

        <Card className="p-5">
          <h2 className="text-base font-bold text-heading">
            {meta.title}
            {/* The heading carries the filter, so a short list never reads as
                a missing estate. */}
            {assignment !== "All" && (
              <span className="font-semibold text-muted"> · {assignment}</span>
            )}
          </h2>

          <div className="mt-4">
            <DeviceInventoryTable
              devices={visible}
              onViewHistory={setHistoryFor}
              emptyMessage={
                assignment === "All"
                  ? `No ${meta.plural} registered yet.`
                  : `No ${assignment.toLowerCase()} ${meta.plural}.`
              }
            />
          </div>

          <Pagination
            className="mt-5"
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={rows.length}
            itemLabel={meta.plural}
            onPageChange={setPage}
          />
        </Card>
      </div>

      <AddDeviceModal
        isOpen={addDevice.isOpen}
        onClose={addDevice.close}
        category={category}
        takenSerials={takenSerials}
        onAdd={handleAdd}
      />

      <AssignHistoryModal
        device={historyFor}
        onClose={() => setHistoryFor(null)}
      />
    </>
  );
};

export default DevicePage;
