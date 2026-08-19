/** Connection settings that drive every generated command. */
export interface AgentConfig {
  serverIp: string;
  serverPort: string;
  /** Hides the raw URL behind an encoded payload in the output. */
  obfuscate: boolean;
}

/** Downloadable launcher formats, one per host platform. */
export type LauncherId = "win-vbs" | "macos" | "linux";

/**
 * Where the machine about to be audited belongs. Collected before a launcher
 * is handed over, so the report that comes back can be filed against a real
 * place instead of arriving anonymously.
 */
export interface LauncherRegistration {
  companyName: string;
  city: string;
  site: string;
}

/** One shell snippet inside a deployment card. */
export interface CommandSnippet {
  id: string;
  /** Terminal window caption, e.g. "Windows PowerShell". */
  title: string;
  command: string;
}
