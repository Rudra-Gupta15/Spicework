import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  DEVICE_BANDWIDTH,
  DEVICE_CONNECTION,
  DEVICE_NETWORK_EVENTS,
} from "@/data/deviceLog";
import type { Tone } from "@/types/ui";

/** Pill tone and label per link-state event kind. */
const EVENT_PILL: Record<
  "connect" | "disconnect" | "system",
  { tone: Tone; label: string }
> = {
  connect: { tone: "success", label: "Connect" },
  disconnect: { tone: "warning", label: "Disconnect" },
  system: { tone: "neutral", label: "System" },
};

/** The Network tab: connection details, bandwidth and link-state events. */
export const DeviceNetwork = () => (
  <div className="space-y-6">
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-heading">
            Current Connection
          </h2>
          <Badge tone="success">Online</Badge>
        </div>

        <dl className="mt-4 space-y-3.5">
          {DEVICE_CONNECTION.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <dt className="text-muted">{row.label}</dt>
              <dd
                className={cn(
                  "font-semibold",
                  row.accent ? "text-status-online" : "text-heading",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">
          Bandwidth Utilization
        </h2>

        <ul className="mt-4 space-y-4">
          {DEVICE_BANDWIDTH.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading">
                  {row.label}
                </p>
                <p className="text-[13px] text-muted">{row.detail}</p>
              </div>
              <p className="text-xl font-bold text-heading tabular-nums">
                {row.value}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </section>

    <Card className="px-5 py-5">
      <h2 className="text-base font-bold text-heading">
        Network Link State Events
      </h2>

      <ul className="mt-2">
        {DEVICE_NETWORK_EVENTS.map((event) => {
          const pill = EVENT_PILL[event.kind];

          return (
            <li
              key={event.id}
              className="flex flex-col gap-2 border-b border-line py-4 last:border-b-0 md:flex-row md:items-center md:gap-4"
            >
              <div className="flex items-center gap-3 md:w-[320px] md:shrink-0">
                <Badge tone={pill.tone} className="w-[92px] justify-center">
                  {pill.label}
                </Badge>
                <p className="font-semibold text-heading">{event.title}</p>
              </div>

              <p className="flex-1 text-sm text-muted">{event.detail}</p>

              <p className="text-sm text-muted whitespace-nowrap">
                {event.timestamp}
              </p>
            </li>
          );
        })}
      </ul>
    </Card>
  </div>
);
