import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Globe, Hash, Kanban, MessageSquare } from "lucide-react";

import { Button, Card, Field, Input } from "@/components/ui";
import { INTEGRATIONS, MASKED_API_KEY } from "@/data/settings";

/** Best-fit glyph per service. */
const ICONS: Record<string, LucideIcon> = {
  slack: Hash,
  teams: MessageSquare,
  jira: Kanban,
  google: Globe,
};

/** The Integrations category: API/webhook keys and connected services. */
export const IntegrationsSettings = () => {
  const [apiKey, setApiKey] = useState(MASKED_API_KEY);
  const [webhook, setWebhook] = useState("");
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const regenerate = () => {
    const suffix = Array.from({ length: 4 }, (_, i) =>
      "0123456789abcdef".charAt((apiKey.length * (i + 3)) % 16),
    ).join("");
    setApiKey(`sp_api_live_••••••••••••${suffix}`);
  };

  const toggle = (id: string) =>
    setIntegrations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item,
      ),
    );

  return (
    <div className="space-y-6">
      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">API & Webhooks</h2>

        <div className="mt-4 space-y-4">
          <Field label="API Key" htmlFor="api-key">
            <div className="flex items-center gap-3">
              <Input
                id="api-key"
                className="bg-canvas font-mono"
                value={apiKey}
                readOnly
                containerClassName="flex-1"
              />
              <Button variant="brand" onClick={regenerate}>
                Regenerate
              </Button>
            </div>
          </Field>

          <Field label="Webhook URL" htmlFor="webhook-url">
            <Input
              id="webhook-url"
              type="url"
              className="bg-canvas"
              value={webhook}
              onChange={(event) => setWebhook(event.target.value)}
              placeholder="https://yourdomain.com/hooks/spiceworks"
            />
          </Field>
        </div>
      </Card>

      <div>
        <h2 className="text-base font-bold text-heading">
          Available Integrations
        </h2>

        <ul className="mt-3 space-y-3">
          {integrations.map((integration) => {
            const Icon = ICONS[integration.id] ?? Hash;

            return (
              <li key={integration.id}>
                <Card className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-heading">
                        {integration.name}
                      </p>
                      <p className="text-[13px] text-muted">
                        {integration.connected ? "Connected" : "Disconnected"}
                      </p>
                    </div>

                    <Button
                      variant={integration.connected ? "outline" : "brand"}
                      onClick={() => toggle(integration.id)}
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>

                  <p className="mt-3 text-sm text-muted">
                    {integration.description}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
