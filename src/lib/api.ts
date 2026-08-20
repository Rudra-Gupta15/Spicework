import { AUTH_ROUTES } from "@/config/auth";
import { clearSession, getToken } from "@/lib/authSession";

/**
 * Base URL for the FastAPI backend. Overridable per-environment via
 * VITE_API_BASE_URL (.env / .env.local — see frontend/.env.development).
 * Falls back to: in production the built frontend is served by the backend
 * itself (StaticFiles mount at "/"), so relative paths resolve correctly;
 * in dev, Vite runs on its own port, so requests are pointed at the backend
 * explicitly.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

/* Auth paths are the ones you call *without* a session, so a 401 from them is
   the answer to the request ("those credentials are wrong"), not an expired
   session — they must not trigger the sign-out below. */
const AUTH_PATHS = ["/api/auth/login", "/api/auth/register"];

const isAuthPath = (path: string) =>
  AUTH_PATHS.some((p) => path.split("?")[0] === p);

/** Bearer header for the stored token, or nothing when signed out. */
const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * A 401 on a normal request means the token is gone, expired or rejected.
 * The session is dropped here — at the one place every request passes
 * through — so a stale token can never leave the app sitting on a page it
 * is no longer entitled to. The redirect is a full assignment rather than a
 * router navigate because this module has no access to the router.
 */
const handleUnauthorized = (path: string) => {
  if (isAuthPath(path)) return;
  clearSession();
  if (window.location.pathname !== AUTH_ROUTES.login) {
    window.location.assign(AUTH_ROUTES.login);
  }
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function throwForStatus(response: Response): Promise<never> {
  const body = await response.text();
  let message = body;
  try {
    const parsed = JSON.parse(body);
    const detail = parsed.detail ?? parsed.message;
    message = typeof detail === "string" ? detail : detail ? JSON.stringify(detail) : body;
  } catch {
    /* body wasn't JSON — use as-is */
  }
  throw new ApiError(message || response.statusText, response.status);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...init?.headers,
    },
  });

  if (response.status === 401) handleUnauthorized(path);

  if (!response.ok) await throwForStatus(response);

  return response.json() as Promise<T>;
}

/** Filename the server suggested via `Content-Disposition`, or a fallback. */
const filenameFromResponse = (response: Response, fallback: string): string => {
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match ? match[1] : fallback;
};

async function requestFile(
  path: string,
  fallbackFilename: string,
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });

  if (response.status === 401) handleUnauthorized(path);

  if (!response.ok) await throwForStatus(response);

  const blob = await response.blob();
  return { blob, filename: filenameFromResponse(response, fallbackFilename) };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  getFile: requestFile,
};
