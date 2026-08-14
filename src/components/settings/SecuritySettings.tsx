import { useState } from "react";
import { Monitor, QrCode } from "lucide-react";

import { Badge, Button, Card, Field, Input, Toggle } from "@/components/ui";
import { ACTIVE_SESSIONS, SECURITY_DEFAULTS } from "@/data/settings";

/** Title + description with a switch on the right. */
const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-heading">{title}</p>
      <p className="mt-0.5 text-[13px] text-muted">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} label={title} hideLabel />
  </div>
);

/** The Security category: password policy, 2FA and active sessions. */
export const SecuritySettings = () => {
  const [values, setValues] = useState(SECURITY_DEFAULTS);
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="h-fit px-5 py-5">
        <h2 className="mb-4 text-base font-bold text-heading">
          Password Policy
        </h2>

        <div className="space-y-4">
          <Field label="Minimum Length" htmlFor="min-length">
            <Input
              id="min-length"
              className="bg-canvas"
              value={values.minLength}
              onChange={(e) => set("minLength", e.target.value)}
              inputMode="numeric"
            />
          </Field>

          <ToggleRow
            title="Require Uppercase"
            description="Must contain at least one uppercase letter"
            checked={values.requireUppercase}
            onChange={(next) => set("requireUppercase", next)}
          />
          <ToggleRow
            title="Require Special Characters"
            description="Must contain symbols like !, @, #"
            checked={values.requireSpecial}
            onChange={(next) => set("requireSpecial", next)}
          />

          <Field label="Password Expiry" htmlFor="password-expiry">
            <Input
              id="password-expiry"
              className="bg-canvas"
              value={values.passwordExpiry}
              onChange={(e) => set("passwordExpiry", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="h-fit px-5 py-5">
        <h2 className="mb-4 text-base font-bold text-heading">
          Two-Factor Authentication
        </h2>

        <ToggleRow
          title="Enable 2FA"
          description="Enforce multi-factor verification for all members"
          checked={values.enable2FA}
          onChange={(next) => set("enable2FA", next)}
        />

        <div className="mt-4 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-canvas text-heading"
          >
            <QrCode className="h-6 w-6" strokeWidth={1.7} />
          </span>
          <div>
            <p className="font-semibold text-heading">Authenticator App</p>
            <p className="text-[13px] text-muted">
              Standard TOTP apps supported
            </p>
          </div>
        </div>

        <Field className="mt-4" label="Backup Codes" htmlFor="backup-codes">
          <Input
            id="backup-codes"
            type="password"
            className="bg-canvas tracking-[0.3em]"
            value={values.backupCodes}
            readOnly
          />
        </Field>
      </Card>

      <Card className="px-5 py-5 lg:col-span-2">
        <h2 className="mb-4 text-base font-bold text-heading">
          Session Management
        </h2>

        <Field label="Session Timeout" htmlFor="session-timeout">
          <Input
            id="session-timeout"
            className="bg-canvas"
            value={values.sessionTimeout}
            onChange={(e) => set("sessionTimeout", e.target.value)}
          />
        </Field>

        <p className="mt-5 mb-1 text-sm font-semibold text-heading">
          Active Sessions
        </p>
        <ul>
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center gap-3 border-b border-line py-4 last:border-b-0"
            >
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas text-muted"
              >
                <Monitor className="h-5 w-5" strokeWidth={1.8} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-heading">
                  {session.device}
                  {session.current && <Badge tone="success">Current</Badge>}
                </p>
                <p className="text-[13px] text-muted">{session.ip}</p>
              </div>

              {!session.current && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-status-offline text-status-offline hover:bg-red-50"
                  onClick={() =>
                    setSessions((current) =>
                      current.filter((item) => item.id !== session.id),
                    )
                  }
                >
                  Revoke
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
