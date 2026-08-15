import { useState } from "react";
import { Wifi } from "lucide-react";

import { Button, Checkbox, Field, Modal, PasswordInput } from "@/components/ui";
import type { WifiNetwork } from "@/types/network";

import { SignalBars } from "./SignalBars";

interface ConnectWifiModalProps {
  /** The access point being joined; `null` keeps the dialog closed. */
  network: WifiNetwork | null;
  onCancel: () => void;
  onConnect: (network: WifiNetwork, password: string, remember: boolean) => void;
  /** True while the connect request is in flight. */
  isConnecting?: boolean;
  /** Server-side failure, e.g. wrong password or connection timeout. */
  connectError?: string;
}

/**
 * Password prompt shown before switching to an access point.
 * Mount it keyed on the network id so each prompt starts empty.
 */
export const ConnectWifiModal = ({
  network,
  onCancel,
  onConnect,
  isConnecting = false,
  connectError,
}: ConnectWifiModalProps) => {
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string>();

  const needsPassword = network?.security !== "Open";

  const handleConnect = () => {
    if (!network) return;

    if (needsPassword && !password) {
      setError("Enter the network password.");
      return;
    }

    onConnect(network, password, remember);
  };

  return (
    <Modal
      isOpen={network !== null}
      onClose={onCancel}
      title="Connect to Network"
      variant="plain"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onCancel}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            variant="brand"
            size="lg"
            className="flex-1"
            onClick={handleConnect}
            isLoading={isConnecting}
          >
            Connect
          </Button>
        </>
      }
    >
      {network && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-canvas px-4 py-3">
            <Wifi
              className="h-5 w-5 shrink-0 text-brand"
              strokeWidth={2}
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="truncate font-semibold text-heading">
                {network.ssid}
              </p>
              <p className="text-[13px] text-muted">
                Security: {network.security}
              </p>
            </div>

            <SignalBars
              strength={network.signal}
              className="ml-auto shrink-0"
            />
          </div>

          {needsPassword && (
            <Field label="Network Password" htmlFor="wifi-password">
              <PasswordInput
                id="wifi-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(undefined);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleConnect();
                }}
                placeholder="Enter the network password"
                autoComplete="off"
                error={error ?? connectError}
              />
            </Field>
          )}

          <Checkbox
            checked={remember}
            onChange={setRemember}
            label="Remember this network"
          />
        </div>
      )}
    </Modal>
  );
};
