import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { Button, Loader, Modal } from "@/components/ui";
import { fetchDeviceScans, type DeviceScan } from "@/data/deviceApi";
import { ApiError } from "@/lib/api";

interface DeviceScanHistoryModalProps {
  /** Computer name of the device whose trail is open; `null` keeps it closed. */
  device: string | null;
  onClose: () => void;
}

/** The page of scans the modal asks for. A machine reporting every few
    minutes builds up hundreds, and nobody reads past the recent ones. */
const LIMIT = 100;

/**
 * When a particular device was scanned.
 *
 * The results table shows one row per machine, carrying only its most recent
 * scan. Everything before that lives here — each audit the machine has filed,
 * newest first, with the OS it was running and the address it reported from,
 * since those are what change between one scan and the next.
 */
export const DeviceScanHistoryModal = ({
  device,
  onClose,
}: DeviceScanHistoryModalProps) => {
  const [scans, setScans] = useState<DeviceScan[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  /* Opening a second device clears the first one's trail before anything
     paints, so no one ever reads the wrong history under the right title.
     Derived during render rather than in the effect below. */
  const [loadedFor, setLoadedFor] = useState<string | null>(device);
  if (device && loadedFor !== device) {
    setLoadedFor(device);
    setScans([]);
    setTotal(0);
    setError(undefined);
    setLoading(true);
  }

  useEffect(() => {
    if (!device) return;

    let cancelled = false;

    fetchDeviceScans(device, LIMIT)
      .then((history) => {
        if (cancelled) return;
        setScans(history.scans);
        setTotal(history.total);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Could not load the scan history.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [device]);

  const description = isLoading
    ? undefined
    : total === scans.length
      ? `Scanned ${total} ${total === 1 ? "time" : "times"}.`
      : `Scanned ${total} times — showing the ${scans.length} most recent.`;

  return (
    <Modal
      isOpen={device !== null}
      onClose={onClose}
      title={device ? `${device} — scan history` : "Scan history"}
      description={error ? undefined : description}
      variant="plain"
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading ? (
        <Loader className="py-6" label="Loading scan history…" />
      ) : error ? (
        <p role="alert" className="py-6 text-center text-sm text-status-offline">
          {error}
        </p>
      ) : scans.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No scans have been recorded for this device.
        </p>
      ) : (
        /* Capped in height rather than paginated: this is a trail to skim,
           and a scrollbar reads faster than a page control for that. */
        <ul className="max-h-[420px] divide-y divide-line overflow-y-auto">
          {scans.map((scan, index) => (
            <li key={scan.id} className="flex items-start gap-3 py-3">
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-muted"
                strokeWidth={1.9}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-heading">
                  {scan.scannedAt}
                  {index === 0 && (
                    <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[12px] font-medium text-brand-600">
                      latest
                    </span>
                  )}
                </p>
                {/* The OS is on every line because a dual-booted machine
                    reports under whichever side was running, and that is the
                    thing most likely to differ between two scans. */}
                <p className="text-[13px] break-words text-muted">
                  {[scan.osName, scan.osVersion].filter(Boolean).join(" ")}
                </p>
                <p className="text-[13px] text-muted">
                  {scan.username} · {scan.ipAddress}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};
