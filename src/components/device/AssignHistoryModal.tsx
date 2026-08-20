import { Button, Modal } from "@/components/ui";
import { assignmentHistory, formatDeviceDate } from "@/data/deviceInventory";
import type { DeviceRecord } from "@/types/device";

interface AssignHistoryModalProps {
  /** The row whose history is open; `null` keeps the dialog closed. */
  device: DeviceRecord | null;
  onClose: () => void;
}

/** Who has held a device, newest spell first. */
export const AssignHistoryModal = ({
  device,
  onClose,
}: AssignHistoryModalProps) => {
  const history = device ? assignmentHistory(device) : [];

  return (
    <Modal
      isOpen={device !== null}
      onClose={onClose}
      title="Assignment history"
      description={device ? `${device.name} · ${device.serialNumber}` : undefined}
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          This device has never been issued — it has been in the store since it
          was registered on {device ? formatDeviceDate(device.buyDate) : "—"}.
        </p>
      ) : (
        <ol className="space-y-3">
          {history.map((entry) => {
            const isCurrent = !entry.returnedOn;

            return (
              <li
                key={entry.id}
                className="rounded-lg border border-line bg-canvas/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-heading">
                    {entry.user}
                  </p>
                  <span
                    className={
                      isCurrent
                        ? "rounded-full bg-signal-50 px-2.5 py-0.5 text-[11px] font-semibold text-signal-600"
                        : "rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-semibold text-muted"
                    }
                  >
                    {isCurrent ? "Current" : "Returned"}
                  </span>
                </div>

                <p className="mt-1 text-[13px] text-muted">
                  {formatDeviceDate(entry.assignedOn)} —{" "}
                  {entry.returnedOn ? formatDeviceDate(entry.returnedOn) : "present"}
                </p>

                {entry.note && (
                  <p className="mt-1 text-[13px] text-muted">{entry.note}</p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Modal>
  );
};
