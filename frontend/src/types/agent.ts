/** Connection settings that drive every generated command. */
export interface AgentConfig {
  serverIp: string;
  serverPort: string;
  /** Hides the raw URL behind an encoded payload in the output. */
  obfuscate: boolean;
}

/** Downloadable launcher formats, one per host platform. */
export type LauncherId = "win-exe" | "win-vbs" | "macos" | "linux";

/** One shell snippet inside a deployment card. */
export interface CommandSnippet {
  id: string;
  /** Terminal window caption, e.g. "Windows PowerShell". */
  title: string;
  command: string;
}
