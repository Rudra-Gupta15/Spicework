import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";

import { AgentConfigCard } from "@/components/agent/AgentConfigCard";
import { DeploymentCard } from "@/components/agent/DeploymentCard";
import { DownloadToast } from "@/components/agent/DownloadToast";
import { LauncherDetailsModal } from "@/components/agent/LauncherDetailsModal";
import { LauncherGuide } from "@/components/agent/LauncherGuide";
import { LauncherTabs } from "@/components/agent/LauncherTabs";
import { SmartScreenModal } from "@/components/agent/SmartScreenModal";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, Badge, Button, Loader } from "@/components/ui";
import { CURRENT_COMPANY } from "@/config/company";
import {
  DEFAULT_AGENT_CONFIG,
  daemonSnippets,
  downloadLauncher,
  fetchAuditStatus,
  fetchServerInfo,
  generateClientId,
  localSnippets,
  remoteSnippets,
} from "@/data/agent";
import { useDisclosure } from "@/hooks/useDisclosure";
import { ApiError } from "@/lib/api";
import { downloadBlob, formatBytes } from "@/lib/download";
import type {
  AgentConfig,
  LauncherId,
  LauncherRegistration,
} from "@/types/agent";

interface DownloadInfo {
  filename: string;
  size: string;
  /** Windows launchers trip SmartScreen when run. */
  isWindows: boolean;
}

const GUIDE_ANCHOR_ID = "launcher-guide";

/**
 * What the details dialog opens on. The company is known — this install
 * belongs to it — but where the machine sits is not, so those stay blank
 * until somebody says.
 */
const BLANK_REGISTRATION: LauncherRegistration = {
  companyName: CURRENT_COMPANY.name,
  city: "",
  site: "",
};

/** How often to check whether a triggered audit has reported back. */
const STATUS_POLL_MS = 3000;
/** Stop polling after ~5 minutes so a launcher that's never run doesn't poll forever. */
const STATUS_POLL_MAX_ATTEMPTS = 100;

const AgentPage = () => {
  /* One id per page visit — every download and command snippet below is
     tagged with it, so the status badge can track whichever one gets run. */
  const [clientId] = useState(generateClientId);

  /* The saved settings; edits stay in `draft` until Save. */
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [draft, setDraft] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  /* What "Reset Defaults" returns to — the detected address once it arrives. */
  const [defaults, setDefaults] = useState<AgentConfig>(DEFAULT_AGENT_CONFIG);
  const [launcher, setLauncher] = useState<LauncherId>("win-exe");
  /* The format whose details dialog is open, if any — nothing is fetched
     until it is filled in and confirmed. */
  const [pending, setPending] = useState<LauncherId | null>(null);
  /* Carried between downloads so grabbing a second format is one click. */
  const [registration, setRegistration] =
    useState<LauncherRegistration>(BLANK_REGISTRATION);
  const [download, setDownload] = useState<DownloadInfo | null>(null);
  const [isDownloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>();
  /* The launcher whose SmartScreen prompt is open, if any. */
  const [running, setRunning] = useState<string | null>(null);
  const [isActive, setActive] = useState(false);
  const [isWaiting, setWaiting] = useState(false);
  const guide = useDisclosure();

  /* The panel sits below the launcher pills it refers to, which on a short
     window is off-screen — opening it from the header has to bring it into
     view or the button looks like it did nothing. */
  const toggleGuide = useCallback(() => {
    if (guide.isOpen) {
      guide.close();
      return;
    }

    guide.open();
    window.requestAnimationFrame(() =>
      document
        .getElementById(GUIDE_ANCHOR_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }, [guide]);

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
    setDraft(defaults);
    setConfig(defaults);
  }, [defaults]);

  /* Ask the backend what address it is reachable on and adopt it as the
     default. Only applied while the fields are still untouched, so it can
     never overwrite an address the user typed. */
  useEffect(() => {
    let cancelled = false;

    fetchServerInfo()
      .then(({ ip, port }) => {
        if (cancelled || !ip) return;
        const detected: AgentConfig = {
          ...DEFAULT_AGENT_CONFIG,
          serverIp: ip,
          serverPort: port || DEFAULT_AGENT_CONFIG.serverPort,
        };
        setDefaults(detected);
        setConfig((current) => (current === DEFAULT_AGENT_CONFIG ? detected : current));
        setDraft((current) => (current === DEFAULT_AGENT_CONFIG ? detected : current));
      })
      .catch(() => {
        /* Detection is a convenience — keep the hard-coded default on failure. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Confirming the details dialog fetches the real file from the backend,
     which also opens a tracked session for `clientId` on the server. */
  const fetchLauncher = useCallback(
    async (id: LauncherId, details: LauncherRegistration) => {
      setLauncher(id);
      setPending(null);
      setRegistration(details);
      setDownloading(true);
      setDownloadError(undefined);
      try {
        const { blob, filename } = await downloadLauncher(id, clientId, details);
        downloadBlob(filename, blob);
        setDownload({
          filename,
          size: formatBytes(blob.size),
          isWindows: id === "win-exe" || id === "win-vbs",
        });
      } catch (error) {
        setDownloadError(
          error instanceof ApiError || error instanceof Error
            ? error.message
            : "Could not download the launcher.",
        );
      } finally {
        setDownloading(false);
      }
    },
    [clientId],
  );

  /* Clicking the download "runs" it — Windows launchers hit SmartScreen. */
  const runDownload = useCallback(() => {
    if (!download?.isWindows) return;
    setRunning(download.filename);
    setDownload(null);
  }, [download]);

  /* The browser can't actually execute the downloaded file, so "confirming"
     just starts watching the server for the real audit it's expected to
     trigger — `isActive` only flips once that report genuinely arrives. */
  const confirmRun = useCallback(() => {
    setRunning(null);
    setWaiting(true);
  }, []);

  useEffect(() => {
    if (!isWaiting) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      fetchAuditStatus(clientId)
        .then((session) => {
          if (session.status === "completed") {
            setActive(true);
            setWaiting(false);
          } else if (session.status === "failed" || attempts >= STATUS_POLL_MAX_ATTEMPTS) {
            setWaiting(false);
          }
        })
        .catch(() => {
          /* Transient network hiccup — try again on the next tick. */
        });
    }, STATUS_POLL_MS);

    return () => window.clearInterval(timer);
  }, [isWaiting, clientId]);

  /* Commands preview the draft, so edits show before they are saved. */
  const local = useMemo(() => localSnippets(draft, clientId), [draft, clientId]);
  const remote = useMemo(() => remoteSnippets(draft, clientId), [draft, clientId]);
  const daemon = useMemo(() => daemonSnippets(draft), [draft]);

  return (
    <>
      <Navbar
        title="Terminal Command"
        subtitle="Generate, Edit & Copy Audit Deployment Commands"
        actions={
          <>
            <Button
              variant="brand"
              aria-expanded={guide.isOpen}
              aria-controls={GUIDE_ANCHOR_ID}
              leftIcon={<BookOpen className="h-4 w-4" strokeWidth={2.1} />}
              onClick={toggleGuide}
            >
              {guide.isOpen ? "Hide Guide" : "User Guide"}
            </Button>

            <Badge
              tone={isActive ? "success" : "neutral"}
              className="gap-1.5"
            >
              <span
                aria-hidden="true"
                className={
                  isActive || isWaiting
                    ? "h-2 w-2 animate-pulse rounded-full bg-status-online"
                    : "h-2 w-2 rounded-full bg-status-neutral"
                }
              />
              {isActive ? "Active" : isWaiting ? "Waiting for audit…" : "Standby"}
            </Badge>
            <Avatar name={CURRENT_COMPANY.name} variant="auto" />
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
            <LauncherTabs value={launcher} onChange={setPending} />
          </div>
          {isDownloading && (
            <Loader
              variant="inline"
              label="Preparing launcher…"
              className="mt-2"
            />
          )}
          {downloadError && (
            <p className="mt-2 text-[13px] text-status-offline">{downloadError}</p>
          )}

          {guide.isOpen && (
            <div id={GUIDE_ANCHOR_ID} className="mt-5">
              <LauncherGuide onHide={guide.close} />
            </div>
          )}
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

      {pending && (
        <LauncherDetailsModal
          launcher={pending}
          initial={registration}
          onClose={() => setPending(null)}
          onDownload={(details) => void fetchLauncher(pending, details)}
        />
      )}

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
