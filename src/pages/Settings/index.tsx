import { useRef, useState } from "react";
import { Plus } from "lucide-react";

import { AgentConfigSettings } from "@/components/settings/AgentConfigSettings";
import { AssetFieldSettings } from "@/components/settings/AssetFieldSettings";
import { BulkUploadAssetsModal } from "@/components/settings/BulkUploadAssetsModal";
import {
  BulkUploadMenu,
  type BulkUploadKind,
} from "@/components/settings/BulkUploadMenu";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { UserManagement } from "@/components/settings/UserManagement";
import { Button } from "@/components/ui";
import type { SettingsCategory } from "@/data/settings";
import type { ImportSummary } from "@/types/bulkImport";
import { useToast } from "@/hooks/useToast";

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
  "Asset Fields": {
    title: "Asset Field Configuration",
    subtitle:
      "Define the owners and locations an asset can be assigned to, and review the fields the product fixes for you",
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
};

const SettingsPage = () => {
  const toast = useToast();
  const [category, setCategory] = useState<SettingsCategory>("General");
  const [saved, setSaved] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  /* Which of the two uploads is open, if either. */
  const [bulkKind, setBulkKind] = useState<BulkUploadKind | null>(null);

  /* General owns its own fields; it hands its commit back through this so
     the header button can fire it. */
  const saveGeneral = useRef<(() => void) | null>(null);

  const meta = META[category];

  /* Only General has a header commit — every other category writes as you
     go, from inside its own panel. */
  const save = () => {
    saveGeneral.current?.();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  /* The upload writes to the inventory itself, a row at a time, and says
     what it did once it has finished — the page only has to report it. */
  const assetsImported = (summary: ImportSummary) => {
    const written = summary.created + summary.updated;
    const left = summary.invalid + summary.failed;

    toast({
      tone: written > 0 ? "success" : "danger",
      title:
        written > 0
          ? `${summary.created} added · ${summary.updated} updated`
          : "Nothing was imported",
      description:
        written > 0
          ? left > 0
            ? `${left} ${left === 1 ? "row was" : "rows were"} left out — download the error report to fix and re-upload.`
            : "New assets stay Offline until an agent scan reaches them."
          : "Every row in that file was left out.",
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <SettingsNav active={category} onChange={setCategory} />

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1 basis-64">
            <h1 className="text-[22px] leading-tight font-bold wrap-break-word text-heading sm:text-[26px] lg:text-[30px]">
              {meta.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{meta.subtitle}</p>
          </div>

          {category === "General" && (
            <Button variant="brand" onClick={save}>
              {saved ? "Saved" : "Save Changes"}
            </Button>
          )}
          {category === "User Management" && (
            <div className="flex flex-wrap items-center gap-3">
              <BulkUploadMenu onPick={setBulkKind} />
              <Button
                variant="brand"
                leftIcon={<Plus className="h-4 w-4" strokeWidth={2.4} />}
                onClick={() => setInviteOpen(true)}
              >
                Invite User
              </Button>
            </div>
          )}
          {/* Assets are uploaded against the owners, locations and custom
              fields this screen defines, so the button belongs here too. */}
          {category === "Asset Fields" && <BulkUploadMenu onPick={setBulkKind} />}
        </header>

        <div className="mt-6">
          {category === "General" && <GeneralSettings saveRef={saveGeneral} />}
          {category === "User Management" && (
            <UserManagement
              inviteOpen={inviteOpen}
              onCloseInvite={() => setInviteOpen(false)}
              bulkOpen={bulkKind === "users"}
              onCloseBulk={() => setBulkKind(null)}
            />
          )}
          {/* Adding an owner or a location is done from inside the panel's
              own tab, so this category needs no header action. */}
          {category === "Asset Fields" && <AssetFieldSettings />}
          {category === "Security" && <SecuritySettings />}
          {category === "Agent Config" && <AgentConfigSettings />}
        </div>
      </div>

      {/* Assets belong to the estate rather than to any settings category,
          so the upload lives on the page instead of inside a panel. */}
      {bulkKind === "assets" && (
        <BulkUploadAssetsModal
          onClose={() => setBulkKind(null)}
          onFinished={assetsImported}
        />
      )}
    </div>
  );
};

export default SettingsPage;
