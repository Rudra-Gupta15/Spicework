import { Cpu } from "lucide-react";

import { Card } from "@/components/ui";
import { DEVICE_HARDWARE, DEVICE_PERIPHERALS } from "@/data/deviceLog";

/** The Hardware tab: the spec sheet plus attached peripherals. */
export const DeviceHardware = () => (
  <div className="space-y-6">
    <Card className="px-6 py-5">
      <h2 className="text-base font-bold text-heading">
        Hardware Specifications
      </h2>

      <dl className="mt-2">
        {DEVICE_HARDWARE.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-1 gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[minmax(180px,240px)_1fr] sm:gap-4"
          >
            <dt className="text-sm text-muted">{spec.label}</dt>
            <dd className="text-sm font-semibold text-heading">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </Card>

    <Card className="px-6 py-5">
      <h2 className="text-base font-bold text-heading">Connected Peripherals</h2>

      <ul className="mt-2">
        {DEVICE_PERIPHERALS.map((peripheral) => (
          <li
            key={peripheral.id}
            className="flex items-center gap-3 border-b border-line py-4 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-muted"
            >
              <Cpu className="h-5 w-5" strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
              <p className="font-semibold text-heading">{peripheral.name}</p>
              <p className="mt-0.5 text-[13px] text-muted">
                Type: {peripheral.type}
                <span className="mx-2 text-navy-300">•</span>
                Interface: {peripheral.interface}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  </div>
);
