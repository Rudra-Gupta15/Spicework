import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui";
import { requestRescan } from "@/data/deviceApi";

interface RescanButtonProps {
  /** Devices to scan. One for a machine row, several for a row that spans machines. */
  deviceIds: string[];
  /** What the button is asking to refresh, for the title text. */
  label?: string;
  onDone?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * Asks a machine to scan now instead of waiting for its next scheduled run.
 *
 * The agent cannot be reached inbound — it sits behind its office's NAT — so
 * this only leaves a request the machine collects on its next check-in, and
 * the scan takes a minute or two after that. The button says "Requested"
 * rather than pretending the inventory has already refreshed, because a row
 * that has not changed yet is the normal case, not a failure.
 */
export const RescanButton = ({
  deviceIds,
  label,
  onDone,
  onError,
}: RescanButtonProps) => {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const run = async (event: React.MouseEvent) => {
    /* These sit inside clickable rows that open the detail page. */
    event.stopPropagation();
    if (state !== "idle" || deviceIds.length === 0) return;

    setState("sending");
    try {
      const results = await Promise.allSettled(deviceIds.map(requestRescan));
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === results.length) throw new Error("No device accepted the request.");

      setState("sent");
      onDone?.(
        deviceIds.length === 1
          ? "Scan requested — the device will report back within a few minutes."
          : `Scan requested on ${results.length - failed} of ${deviceIds.length} devices.`,
      );
    } catch (error) {
      setState("idle");
      onError?.(
        error instanceof Error ? error.message : "Could not request a scan.",
      );
    }
  };

  const many = deviceIds.length > 1;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={run}
      disabled={state !== "idle" || deviceIds.length === 0}
      leftIcon={
        <RefreshCw
          className={`h-3.5 w-3.5 ${state === "sending" ? "animate-spin" : ""}`}
          strokeWidth={2.2}
        />
      }
      title={
        deviceIds.length === 0
          ? "No device to scan"
          : many
            ? `Ask all ${deviceIds.length} devices with ${label ?? "this"} to scan now`
            : `Ask ${label ?? "this device"} to scan now`
      }
    >
      {state === "sent" ? "Requested" : "Rescan"}
    </Button>
  );
};
