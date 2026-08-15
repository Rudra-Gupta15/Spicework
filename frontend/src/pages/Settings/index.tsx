import { useRef, useState } from "react";
import { Plus } from "lucide-react";

import { AgentConfigSettings } from "@/components/settings/AgentConfigSettings";
import { BackupSettings } from "@/components/settings/BackupSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { UserManagement } from "@/components/settings/UserManagement";
import { Button } from "@/components/ui";
import type { SettingsCategory } from "@/data/settings";

/** Header title + subtitle per category. */
const META: Record<SettingsCategory, { title: string; subtitle: string }> = {
  General: {
    title: "General Settings",
    subtitle: "Manage your basic organization profile and portal branding",
  },
  "User Management": {
    title: "Team Members",
    subtitle: "Everyone with portal access, the site they work from and the role they hold",
  },
  Notifications: {
    title: "Notification Preferences",
    subtitle:
      "Configure alerts and notification targets across emails and agent collect",
  },
  Security: {
    title: "Security Settings",
    subtitle: "Manage authorization methods, session policies, and global credentials",
  },
  "Agent Config": {
    title: "Agent Configuration",
    subtitle:
      "Manage background collection daemons, deployment packages, and scan frequency",
  },
  Integrations: {
    title: "Connected Services",
    subtitle: "Manage authorization endpoints and service hooks",
  },
  "Backup & Data": {
    title: "Backup & Data",
    subtitle: "Configure data preservation policies, manual exports, and recovery targets",
  },
  Billing: {
    title: "Billing & Subscription",
    subtitle: "Manage your subscription, invoices, and platform resource usage",
  },
};

const SettingsPage = () => {
  const [category, setCategory] = useState<SettingsCategory>("General");
  const [saved, setSaved] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  /* General owns its own fields; it hands its commit back through this so
     the header button can fire it. */
  const saveGeneral = useRef<(() => void) | null>(null);

  const meta = META[category];

  const save = () => {
    if (category === "General") saveGeneral.current?.();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <SettingsNav active={category} onChange={setCategory} />

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1 basis-64">
            <h1 className="text-[22px] leading-tight font-bold break-words text-heading sm:text-[26px] lg:text-[30px]">
              {meta.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{meta.subtitle}</p>
          </div>

          {(category === "General" || category === "Backup & Data") && (
            <Button variant="brand" onClick={save}>
              {saved ? "Saved" : "Save Changes"}
            </Button>
          )}
          {category === "User Management" && (
            <Button
              variant="brand"
              leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
              onClick={() => setInviteOpen(true)}
            >
              Invite User
            </Button>
          )}
        </header>

        <div className="mt-6">
          {category === "General" && <GeneralSettings saveRef={saveGeneral} />}
          {category === "User Management" && (
            <UserManagement
              inviteOpen={inviteOpen}
              onCloseInvite={() => setInviteOpen(false)}
            />
          )}
          {category === "Notifications" && <NotificationSettings />}
          {category === "Security" && <SecuritySettings />}
          {category === "Integrations" && <IntegrationsSettings />}
          {category === "Agent Config" && <AgentConfigSettings />}
          {category === "Backup & Data" && <BackupSettings />}
          {category === "Billing" && <BillingSettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
