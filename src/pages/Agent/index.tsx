import { useCallback, useMemo, useState } from "react";

import { AgentConfigCard } from "@/components/agent/AgentConfigCard";
import { DeploymentCard } from "@/components/agent/DeploymentCard";
import { DownloadToast } from "@/components/agent/DownloadToast";
import { LauncherTabs } from "@/components/agent/LauncherTabs";
import { SmartScreenModal } from "@/components/agent/SmartScreenModal";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, Badge } from "@/components/ui";
import { CURRENT_USER } from "@/config/user";
import {
  DEFAULT_AGENT_CONFIG,
  buildLauncher,
  daemonSnippets,
  localSnippets,
  remoteSnippets,
} from "@/data/agent";
import { downloadText, formatBytes } from "@/lib/download";
import type { AgentConfig, LauncherId } from "@/types/agent";

interface DownloadInfo {
  filename: string;
  size: string;
  /** Windows launchers trip SmartScreen when run. */
  isWindows: boolean;
}

const AgentPage = () => {
  /* The saved settings; edits stay in `draft` until Save. */
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [draft, setDraft] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [launcher, setLauncher] = useState<LauncherId>("win-exe");
  const [download, setDownload] = useState<DownloadInfo | null>(null);
  /* The launcher whose SmartScreen prompt is open, if any. */
  const [running, setRunning] = useState<string | null>(null);
  const [isActive, setActive] = useState(false);

  const isDirty = useMemo(
    () =>
      draft.serverIp !== config.serverIp ||
      draft.serverPort !== config.serverPort ||
      draft.obfuscate !== config.obfuscate,
    [draft, config],
  );

  const patch = useCallback(
    (next: Partial<AgentConfig>) =>
      setDraft((current) => ({ ...current, ...next })),
    [],
  );

  const save = useCallback(() => setConfig(draft), [draft]);

  const reset = useCallback(() => {
    setDraft(DEFAULT_AGENT_CONFIG);
    setConfig(DEFAULT_AGENT_CONFIG);
  }, []);

  /* Selecting a launcher downloads it and drops in the confirmation toast. */
  const pickLauncher = useCallback(
    (id: LauncherId) => {
      setLauncher(id);

      const file = buildLauncher(id, draft);
      downloadText(file.filename, file.content);
      setDownload({
        filename: file.filename,
        size: formatBytes(new Blob([file.content]).size),
        isWindows: id === "win-exe" || id === "win-vbs",
      });
    },
    [draft],
  );

  /* Clicking the download "runs" it — Windows launchers hit SmartScreen. */
  const runDownload = useCallback(() => {
    if (!download?.isWindows) return;
    setRunning(download.filename);
    setDownload(null);
  }, [download]);

  const confirmRun = useCallback(() => {
    setRunning(null);
    setActive(true);
  }, []);

  /* Commands preview the draft, so edits show before they are saved. */
  const local = useMemo(() => localSnippets(draft), [draft]);
  const remote = useMemo(() => remoteSnippets(draft), [draft]);
  const daemon = useMemo(() => daemonSnippets(draft), [draft]);

  return (
    <>
      <Navbar
        title="Terminal Command"
        subtitle="Generate, Edit & Copy Audit Deployment Commands"
        actions={
          <>
            <Badge
              tone={isActive ? "success" : "neutral"}
              className="gap-1.5"
            >
              <span
                aria-hidden="true"
                className={
                  isActive
                    ? "h-2 w-2 animate-pulse rounded-full bg-status-online"
                    : "h-2 w-2 rounded-full bg-status-neutral"
                }
              />
              {isActive ? "Active" : "Standby"}
            </Badge>
            <Avatar name={CURRENT_USER.name} variant="auto" />
          </>
        }
      />

      <div className="mt-6 space-y-6">
        <AgentConfigCard
          config={draft}
          onChange={patch}
          onSave={save}
          onReset={reset}
          isDirty={isDirty}
        />

        <section>
          <h2 className="text-[15px] font-bold text-heading">
            1-Click Double-Clickable Launchers (No Terminal Required!)
          </h2>
          <p className="mt-1 text-sm text-muted">
            Download and double-click to run - no command line needed.
          </p>

          <div className="mt-4">
            <LauncherTabs value={launcher} onChange={pickLauncher} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DeploymentCard
            title="1. Self Laptop (Local Host)"
            subtitle="Runs on your own machine / 127.0.0.1"
            snippets={local}
          />
          <DeploymentCard
            title="2. Another Laptop (Network / Remote)"
            subtitle={`Runs from remote device / ${draft.serverIp} Offline`}
            snippets={remote}
          />
        </section>

        <DeploymentCard
          title="3. Run-Once Continuous 2-Hour Auto-Audit Daemon"
          subtitle="Runs continuously in the background every 2 hours - fire and forget."
          snippets={daemon}
          columns
          badge={<Badge tone="success">Recommended</Badge>}
        />
      </div>

      {download && (
        <DownloadToast
          filename={download.filename}
          size={download.size}
          onRun={download.isWindows ? runDownload : undefined}
          onClose={() => setDownload(null)}
        />
      )}

      {running && (
        <SmartScreenModal
          filename={running}
          onRun={confirmRun}
          onDismiss={() => setRunning(null)}
        />
      )}
    </>
  );
};

export default AgentPage;
