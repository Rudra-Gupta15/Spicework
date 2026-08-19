import { api } from "@/lib/api";
import type {
  AgentConfig,
  CommandSnippet,
  LauncherId,
  LauncherRegistration,
} from "@/types/agent";

/** Used only until `fetchServerInfo` resolves, and if that call fails. */
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  serverIp: "192.168.1.67",
  serverPort: "8000",
  obfuscate: true,
};

interface ServerInfo {
  ip: string;
  port: string;
}

/** GET /api/server-info — the address the backend sees itself on, so the
    generated commands follow the host's current DHCP lease instead of a
    hard-coded address that goes stale the moment the network changes. */
export const fetchServerInfo = () => api.get<ServerInfo>("/api/server-info");

/** Loopback address a machine uses to reach the audit server on itself. */
export const LOCAL_HOST = "127.0.0.1";

/**
 * The formats offered for download.
 *
 * `win-exe` is deliberately absent. The backend compiles that launcher on
 * demand with `C:\Windows\...\csc.exe`, which only exists when the API itself
 * runs on Windows; on the Linux host it serves a VBS file under an .exe name
 * instead. Offering a button that hands people the wrong kind of file is worse
 * than not offering it — `win-vbs` does the identical job with no compiler.
 * The endpoint and id are kept below so the option can return if the server
 * ever gains a real Windows compiler.
 */
export const LAUNCHERS: { id: LauncherId; label: string }[] = [
  { id: "win-vbs", label: "Windows VBS (.vbs)" },
  { id: "macos", label: "macOS Launcher (.command)" },
  { id: "linux", label: "Linux Launcher (.sh)" },
];

/** `http://192.168.1.67:8000`, from the current connection settings. */
const baseUrl = (host: string, port: string): string =>
  `http://${host}:${port}`;

/** base64 that falls back to the raw string outside the browser. */
const btoaSafe = (value: string): string =>
  typeof btoa === "function" ? btoa(value) : value;

/**
 * base64 of the UTF-16LE bytes of `value` — the exact encoding PowerShell's
 * `-EncodedCommand` expects. Plain base64 (btoaSafe) is UTF-8 and PowerShell
 * rejects it, so this must be used for any `-EncodedCommand` payload.
 */
const btoaSafe16 = (value: string): string => {
  if (typeof btoa !== "function") return value;
  let binary = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    binary += String.fromCharCode(code & 0xff, (code >> 8) & 0xff);
  }
  return btoa(binary);
};

/**
 * Windows one-liner. Pulls and runs backend/scripts/audit.ps1 via `/api/sys-win`.
 *
 * The readable form is a plain `irm '…' | iex`, which is safe to paste straight
 * into a PowerShell window. The old `powershell -Command "$s = irm …"` wrapper
 * broke there: pasted into an existing PowerShell, the *outer* shell expanded
 * `$s` to nothing before the inner powershell.exe ran, leaving `if () { … }`
 * and a "Missing condition" parser error. It only worked from cmd.exe.
 *
 * The obfuscated form hides the URL behind a base64 `-EncodedCommand` payload
 * (immune to that outer expansion, so it runs from any shell). It keeps the
 * `$s` guard so a failed fetch simply does nothing instead of running an error.
 */
const winCommand = (url: string, clientId: string, obfuscate: boolean): string => {
  const target = `${url}/api/sys-win?client_id=${clientId}`;
  return obfuscate
    ? `powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${btoaSafe16(
        `$s = irm '${target}'; if ($s) { iex $s }`,
      )}`
    : `irm '${target}' | iex`;
};

/** macOS/Linux one-liner. Pulls and runs backend/scripts/audit.sh via `/api/sys-agent-mac`. */
const nixCommand = (url: string, clientId: string, obfuscate: boolean): string => {
  const command = `curl -s ${url}/api/sys-agent-mac?client_id=${clientId}`;
  return obfuscate
    ? `bash <(echo ${btoaSafe(command)} | base64 -d | sh)`
    : `bash <(${command})`;
};

/** Local-host card: the machine audits itself over the loopback address. */
export const localSnippets = (config: AgentConfig, clientId: string): CommandSnippet[] => {
  const url = baseUrl(LOCAL_HOST, config.serverPort);
  return [
    { id: "local-win", title: "Windows PowerShell", command: winCommand(url, clientId, config.obfuscate) },
    { id: "local-nix", title: "macOS & Linux Shell", command: nixCommand(url, clientId, config.obfuscate) },
  ];
};

/** Remote card: another device reaches back to the configured server. */
export const remoteSnippets = (config: AgentConfig, clientId: string): CommandSnippet[] => {
  const url = baseUrl(config.serverIp, config.serverPort);
  return [
    { id: "remote-win", title: "Windows PowerShell", command: winCommand(url, clientId, config.obfuscate) },
    { id: "remote-nix", title: "macOS & Linux Shell", command: nixCommand(url, clientId, config.obfuscate) },
  ];
};

/**
 * Daemon card: pulls the real installer script the backend serves at
 * `/api/install-daemon` (backend/scripts/install_service.ps1 or .sh) and runs it —
 * that script is what actually registers the recurring 2-hour task/cron job.
 */
export const daemonSnippets = (config: AgentConfig): CommandSnippet[] => {
  const url = baseUrl(config.serverIp, config.serverPort);
  return [
    {
      id: "daemon-win",
      title: "Windows (Scheduled Task Daemon)",
      command: `irm '${url}/api/install-daemon?os=windows' | iex`,
    },
    {
      id: "daemon-nix",
      title: "macOS & Linux (cron / Daemon)",
      command: `bash <(curl -s "${url}/api/install-daemon?os=mac")`,
    },
  ];
};

/** Endpoint per launcher format — each returns the actual runnable file. */
const LAUNCHER_ENDPOINT: Record<LauncherId, string> = {
  "win-exe": "/api/download-exe-launcher",
  "win-vbs": "/api/download-vbs-launcher",
  macos: "/api/download-mac-launcher",
  linux: "/api/download-linux-launcher",
};

const LAUNCHER_FALLBACK_NAME: Record<LauncherId, string> = {
  "win-exe": "RunAudit_Windows.exe",
  "win-vbs": "RunAudit_Windows.vbs",
  macos: "RunAudit_Mac.command",
  linux: "RunAudit_Linux.sh",
};

/** What a launcher file is called once it lands, before the server renames it. */
export const launcherFilename = (id: LauncherId): string =>
  LAUNCHER_FALLBACK_NAME[id];

/**
 * Downloads the real launcher file from the backend for the given format.
 * The backend creates a tracked session for `clientId` as a side effect, so
 * `fetchAuditStatus` can be polled afterward to see when it's been run.
 *
 * The company, city and site the downloader entered ride along on the query
 * so the session is tagged with where the machine actually is.
 */
export const downloadLauncher = (
  id: LauncherId,
  clientId: string,
  registration: LauncherRegistration,
) => {
  /* Built rather than concatenated — a site name carries spaces and em
     dashes ("HQ — Mumbai") that have to survive the URL. */
  const query = new URLSearchParams({
    client_id: clientId,
    company: registration.companyName,
    city: registration.city,
    site: registration.site,
  });

  return api.getFile(
    `${LAUNCHER_ENDPOINT[id]}?${query.toString()}`,
    LAUNCHER_FALLBACK_NAME[id],
  );
};

/** `sys_1a2b3c4d5e` — matches the id shape the backend itself generates when none is given. */
export const generateClientId = (): string =>
  `sys_${Math.random().toString(16).slice(2, 12).padEnd(10, "0")}`;

interface AuditSession {
  status: "pending" | "completed" | "failed" | string;
}

/** GET /api/check-status — whether the audit triggered by this client_id has reported back. */
export const fetchAuditStatus = (clientId: string) =>
  api.get<AuditSession>(`/api/check-status?client_id=${clientId}`);
