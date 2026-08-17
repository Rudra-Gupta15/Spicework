import { api } from "@/lib/api";
import type { AgentConfig, CommandSnippet, LauncherId } from "@/types/agent";

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

export const LAUNCHERS: { id: LauncherId; label: string }[] = [
  { id: "win-exe", label: "Windows Binary (.exe Launcher)" },
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
 * Windows one-liner. Pulls and runs backend/scripts/audit.ps1 via `/api/sys-win`
 * — the same script a downloaded launcher invokes. The obfuscated form ships
 * the command as a base64 payload; the plain form is the readable pipe.
 *
 * The URL is single-quoted and the script is fetched into a variable before
 * `iex` runs it. Piping `irm` straight into `iex` executes whatever came back —
 * so a connection error (the server restarting, wrong host) gets run as code
 * and produces a wall of unrelated parser errors. Guarding on `$s` means a
 * failed fetch simply does nothing instead.
 */
const winCommand = (url: string, clientId: string, obfuscate: boolean): string => {
  const inner = `$s = irm '${url}/api/sys-win?client_id=${clientId}'; if ($s) { iex $s }`;
  return obfuscate
    ? `powershell -NoProfile -ExecutionPolicy Bypass -Command "${inner}"`
    : `powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${btoaSafe16(inner)}`;
};

/** macOS/Linux one-liner. Pulls and runs backend/scripts/audit.sh via `/api/sys-agent-mac`. */
const nixCommand = (url: string, clientId: string, obfuscate: boolean): string => {
  const command = `curl -s ${url}/api/sys-agent-mac?client_id=${clientId}`;
  return obfuscate
    ? `bash <(${command})`
    : `bash <(echo ${btoaSafe(command)} | base64 -d | sh)`;
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
      command: `powershell -NoProfile -ExecutionPolicy Bypass -Command "$s = irm '${url}/api/install-daemon?os=windows'; if ($s) { iex $s }"`,
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

/**
 * Downloads the real launcher file from the backend for the given format.
 * The backend creates a tracked session for `clientId` as a side effect, so
 * `fetchAuditStatus` can be polled afterward to see when it's been run.
 */
export const downloadLauncher = (id: LauncherId, clientId: string) =>
  api.getFile(`${LAUNCHER_ENDPOINT[id]}?client_id=${clientId}`, LAUNCHER_FALLBACK_NAME[id]);

/** `sys_1a2b3c4d5e` — matches the id shape the backend itself generates when none is given. */
export const generateClientId = (): string =>
  `sys_${Math.random().toString(16).slice(2, 12).padEnd(10, "0")}`;

interface AuditSession {
  status: "pending" | "completed" | "failed" | string;
}

/** GET /api/check-status — whether the audit triggered by this client_id has reported back. */
export const fetchAuditStatus = (clientId: string) =>
  api.get<AuditSession>(`/api/check-status?client_id=${clientId}`);
