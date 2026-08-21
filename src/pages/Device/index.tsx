import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { AddDeviceModal } from "@/components/device/AddDeviceModal";
import { AssignHistoryModal } from "@/components/device/AssignHistoryModal";
import { DeviceInventoryTable } from "@/components/device/DeviceInventoryTable";
import { DeviceTypeTabs } from "@/components/device/DeviceTypeTabs";
import { EditDeviceModal } from "@/components/device/EditDeviceModal";
import { Navbar } from "@/components/layout/Navbar";
import { Button, Card, Loader, Pagination, Select } from "@/components/ui";
import {
  DEVICE_ASSIGNMENT_FILTERS,
  DEVICE_CATEGORIES,
  auditedLaptopRecords,
  categoryTracksAssignment,
  devicesInCategory,
  needsAdoption,
} from "@/data/deviceInventory";
import { useDeviceList } from "@/data/deviceApi";
import { useRegisteredDevices } from "@/data/registeredDevices";
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
 *
 * The estate comes from Postgres, scoped to the signed-in user's organization
 * by the server. One fetch backs all four tabs.
 */
const DevicePage = () => {
  const toast = useToast();
  const { devices, isLoading, error, addDevice, editDevice, reload } = useRegisteredDevices();
  /* The Laptop tab's fallback when nothing has been manually registered —
     see `devicesInCategory`. Loaded alongside the registry rather than only
     when the fallback is actually needed, so switching to Laptop never has
     to wait on a second fetch that only starts once the first one lands. */
  const { devices: auditedDevices, isLoading: auditedLoading } = useDeviceList();
  const auditedLaptops = useMemo(
    () => auditedLaptopRecords(auditedDevices),
    [auditedDevices],
  );
  const [category, setCategory] = useState<DeviceCategory>("Laptop");
  /* Narrows the open tab to what is out with someone, or still in store. */
  const [assignment, setAssignment] = useState<DeviceAssignmentFilter>("All");
  const [page, setPage] = useState(1);
  /* The row whose history is open — `null` while the dialog is closed. */
  const [historyFor, setHistoryFor] = useState<DeviceRecord | null>(null);
  /* The row being edited (or adopted, if it's an audited one) — `null` while
     the dialog is closed. */
  const [editingDevice, setEditingDevice] = useState<DeviceRecord | null>(null);
  const addDeviceModal = useDisclosure();

  const meta = useMemo(
    () =>
      DEVICE_CATEGORIES.find((entry) => entry.id === category) ??
      DEVICE_CATEGORIES[0],
    [category],
  );

  const rows = useMemo(
    () => devicesInCategory(devices, category, assignment, auditedLaptops),
    [devices, category, assignment, auditedLaptops],
  );

  /* True whenever the list on screen is the sample fallback rather than
     anything the org registered — see `devicesInCategory`. Checked off the
     rows themselves so this can never disagree with what the table shows. */
  const showingDemo = rows.length > 0 && rows.every((device) => device.isDemo);

  const visible = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  const tracksAssignment = categoryTracksAssignment(category);

  /* Switching tabs starts at the top of the new list rather than landing on
     a page number that only made sense for the previous one. Landing on a
     category with no holder concept also drops any assignment filter still
     set from a previous tab — left in place, it would narrow Printers by a
     column the tab no longer shows, which reads as rows disappearing for no
     visible reason. */
  const handleCategoryChange = useCallback((next: DeviceCategory) => {
    setCategory(next);
    if (!categoryTracksAssignment(next)) setAssignment("All");
    setPage(1);
  }, []);

  /* The filter carries across tabs — narrowing to unassigned laptops and then
     checking the desktops is the same question asked twice. */
  const handleAssignmentChange = useCallback((next: string) => {
    setAssignment(next as DeviceAssignmentFilter);
    setPage(1);
  }, []);

  /* Guards against registering a serial that already belongs to a machine
     the agent has scanned, not just one already in the manual registry —
     the Laptop tab surfaces both as one list, so a duplicate between them
     would be just as confusing as a duplicate within the registry alone. */
  const takenSerials = useMemo(
    () =>
      [...devices, ...auditedLaptops].map((device) =>
        device.serialNumber.toLowerCase(),
      ),
    [devices, auditedLaptops],
  );

  /* The set above, minus whichever row is being edited — keeping its own
     serial unchanged must never read back as "already taken". */
  const editTakenSerials = useMemo(
    () =>
      editingDevice
        ? takenSerials.filter(
            (serial) => serial !== editingDevice.serialNumber.toLowerCase(),
          )
        : takenSerials,
    [takenSerials, editingDevice],
  );

  /* A new unit goes to the top of its own tab, and the view follows it
     there — adding a printer from the Laptop tab shouldn't look like a
     no-op. The dialog stays open if the save fails, so the entry isn't lost. */
  const handleAdd = useCallback(
    async (draft: DeviceDraft) => {
      const device = await addDevice(draft);

      setCategory(device.category);
      /* A narrowed list could hide the unit that was just registered, so the
         filter is dropped rather than leaving the add looking like a no-op. */
      setAssignment("All");
      setPage(1);
      addDeviceModal.close();

      toast({
        tone: "success",
        title: "Device added",
        description: `${device.name} · ${device.serialNumber}`,
      });
    },
    [addDevice, addDeviceModal, toast],
  );

  /* Adopting an audited row and editing a real one both land here, and both
     end the same way: the tab follows the saved unit, since a category
     change on save would otherwise strand it off-screen the way a fresh
     Add's target category does. */
  const handleEditSave = useCallback(
    async (draft: DeviceDraft) => {
      if (!editingDevice) return;

      const device = needsAdoption(editingDevice)
        ? await addDevice(draft)
        : await editDevice(editingDevice.id, draft);

      setCategory(device.category);
      setAssignment("All");
      setPage(1);
      setEditingDevice(null);

      toast({
        tone: "success",
        title: needsAdoption(editingDevice) ? "Added to the registry" : "Device updated",
        description: `${device.name} · ${device.serialNumber}`,
      });
    },
    [editingDevice, addDevice, editDevice, toast],
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
            {tracksAssignment && (
              <Select
                label="Assignment:"
                options={DEVICE_ASSIGNMENT_FILTERS}
                value={assignment}
                onChange={handleAssignmentChange}
                align="right"
                aria-label="Filter by assignment"
              />
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
              onClick={addDeviceModal.open}
              disabled={isLoading || Boolean(error)}
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

          {showingDemo && !error && !isLoading && !auditedLoading && (
            <p className="mt-2 text-[13px] text-muted">
              No {meta.plural} registered yet — showing sample data. Add a real
              one and this replaces it.
            </p>
          )}

          {/* A failed load is kept distinct from an empty estate: showing
              "No laptops registered yet" when the request never landed would
              be a lie the person acts on. */}
          {error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-status-offline">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={reload}
              >
                Try again
              </Button>
            </div>
          ) : isLoading || (category === "Laptop" && auditedLoading) ? (
            <Loader className="py-10" label="Loading devices…" />
          ) : (
            <>
              <div className="mt-4">
                <DeviceInventoryTable
                  devices={visible}
                  category={category}
                  onViewHistory={setHistoryFor}
                  onEdit={setEditingDevice}
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
            </>
          )}
        </Card>
      </div>

      <AddDeviceModal
        isOpen={addDeviceModal.isOpen}
        onClose={addDeviceModal.close}
        category={category}
        takenSerials={takenSerials}
        onAdd={handleAdd}
      />

      <AssignHistoryModal
        device={historyFor}
        onClose={() => setHistoryFor(null)}
      />

      <EditDeviceModal
        device={editingDevice}
        onClose={() => setEditingDevice(null)}
        takenSerials={editTakenSerials}
        onSave={handleEditSave}
      />
    </>
  );
};

export default DevicePage;
