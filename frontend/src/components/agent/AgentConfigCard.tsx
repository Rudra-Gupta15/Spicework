import { Button, Card, Checkbox, Input } from "@/components/ui";
import type { AgentConfig } from "@/types/agent";

interface AgentConfigCardProps {
  config: AgentConfig;
  onChange: (patch: Partial<AgentConfig>) => void;
  onSave: () => void;
  onReset: () => void;
  /** True while the working values differ from the saved ones. */
  isDirty: boolean;
}

/** Connection settings that feed every generated command below. */
export const AgentConfigCard = ({
  config,
  onChange,
  onSave,
  onReset,
  isDirty,
}: AgentConfigCardProps) => (
  <Card className="px-6 py-6">
    <h2 className="text-lg font-bold text-heading">
      Terminal Audit Deployment Commands
    </h2>
    <p className="mt-1 text-sm text-muted">
      Configure your server connection settings and generate deployment
      commands below.
    </p>

    <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start">
      <Input
        label="Server IP Address"
        value={config.serverIp}
        onChange={(event) => onChange({ serverIp: event.target.value })}
        placeholder="192.168.1.67"
        inputMode="decimal"
        containerClassName="md:flex-1"
      />

      <Input
        label="Server Port"
        value={config.serverPort}
        onChange={(event) => onChange({ serverPort: event.target.value })}
        placeholder="8000"
        inputMode="numeric"
        containerClassName="md:w-32"
      />
    </div>

    <Checkbox
      checked={config.obfuscate}
      onChange={(obfuscate) => onChange({ obfuscate })}
      label="Obfuscate Commands (No URL visible)"
      className="mt-4 font-semibold tracking-wide text-heading uppercase"
    />

    <div className="mt-5 flex flex-wrap gap-3">
      <Button variant="primary" onClick={onSave} disabled={!isDirty}>
        Save Configuration
      </Button>
      <Button variant="outline" onClick={onReset}>
        Reset Defaults
      </Button>
    </div>
  </Card>
);
