/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** FastAPI backend base URL. Unset in production (relative paths — the
      backend serves the built frontend itself); defaults to
      http://localhost:8000 in dev if not overridden. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
