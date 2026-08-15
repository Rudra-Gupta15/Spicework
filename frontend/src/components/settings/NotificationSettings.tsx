import { useState } from "react";

import { Card, Field, Input, Toggle } from "@/components/ui";
import {
  ALERT_THRESHOLDS,
  EMAIL_NOTIFICATIONS,
  PUSH_NOTIFICATIONS,
  type NotificationPref,
} from "@/data/settings";

/** One title + description row with a switch on the right. */
const PrefRow = ({
  pref,
  onToggle,
}: {
  pref: NotificationPref;
  onToggle: (id: string, next: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-heading">{pref.title}</p>
      <p className="mt-0.5 text-[13px] text-muted">{pref.description}</p>
    </div>
    <Toggle
      checked={pref.enabled}
      onChange={(next) => onToggle(pref.id, next)}
      label={pref.title}
      hideLabel
    />
  </div>
);

/** Filled slider with the value shown on the right. */
const ThresholdSlider = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div>
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-heading">{label}</p>
      <span className="text-sm font-bold text-brand tabular-nums">{value}%</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label={label}
      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-brand"
      style={{
        background: `linear-gradient(var(--color-brand), var(--color-brand)) 0/${value}% 100% no-repeat var(--color-line)`,
      }}
    />
  </div>
);

/** The Notifications category: email/push preferences and alert thresholds. */
export const NotificationSettings = () => {
  const [email, setEmail] = useState(EMAIL_NOTIFICATIONS);
  const [push, setPush] = useState(PUSH_NOTIFICATIONS);
  const [cpu, setCpu] = useState(ALERT_THRESHOLDS.cpu);
  const [storage, setStorage] = useState(ALERT_THRESHOLDS.storage);
  const [downtime, setDowntime] = useState(ALERT_THRESHOLDS.downtime);

  const toggle =
    (setter: typeof setEmail) => (id: string, next: boolean) =>
      setter((current) =>
        current.map((pref) =>
          pref.id === id ? { ...pref, enabled: next } : pref,
        ),
      );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="px-5 py-5">
          <h2 className="text-base font-bold text-heading">
            Email Notifications
          </h2>
          <div className="mt-2">
            {email.map((pref) => (
              <PrefRow key={pref.id} pref={pref} onToggle={toggle(setEmail)} />
            ))}
          </div>
        </Card>

        <Card className="px-5 py-5">
          <h2 className="text-base font-bold text-heading">
            Push Notifications
          </h2>
          <div className="mt-2">
            {push.map((pref) => (
              <PrefRow key={pref.id} pref={pref} onToggle={toggle(setPush)} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="h-fit px-5 py-5">
        <h2 className="text-base font-bold text-heading">Alert Thresholds</h2>

        <div className="mt-4 space-y-5">
          <ThresholdSlider
            label="CPU Usage Threshold"
            value={cpu}
            onChange={setCpu}
          />
          <ThresholdSlider
            label="Storage Threshold"
            value={storage}
            onChange={setStorage}
          />

          <Field label="Network downtime alert" htmlFor="downtime">
            <Input
              id="downtime"
              className="bg-canvas"
              value={downtime}
              onChange={(event) => setDowntime(event.target.value)}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
};
