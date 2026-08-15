import { Wifi } from "lucide-react";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { WifiNetwork } from "@/types/network";

import { SignalBars } from "./SignalBars";

interface WifiNetworkListProps {
  networks: WifiNetwork[];
  /** Id of the access point the agent is associated with. */
  activeId: string;
  onSelect: (network: WifiNetwork) => void;
}

/** Scan results — picking a row switches the active association. */
export const WifiNetworkList = ({
  networks,
  activeId,
  onSelect,
}: WifiNetworkListProps) => (
  <ul className="space-y-2.5">
    {networks.map((network) => {
      const isActive = network.id === activeId;

      return (
        <li key={network.id}>
          <button
            type="button"
            onClick={() => onSelect(network)}
            aria-pressed={isActive}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
              "focus-visible:ring-2 focus-visible:ring-signal-500/30 focus-visible:outline-none",
              isActive
                ? "border-signal-500 bg-signal-50"
                : "border-line bg-surface hover:bg-canvas",
            )}
          >
            <Wifi
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                isActive ? "text-signal-600" : "text-heading",
              )}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span className="truncate font-semibold text-heading">
              {network.ssid}
            </span>

            {isActive && (
              <Badge tone="success" className="shrink-0">
                Active
              </Badge>
            )}

            <span className="ml-auto shrink-0 text-[13px] text-muted">
              {network.security}
            </span>

            <SignalBars strength={network.signal} className="shrink-0" />
          </button>
        </li>
      );
    })}
  </ul>
);
