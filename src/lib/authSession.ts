import { SESSION_KEY, TOKEN_KEY } from "@/config/auth";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  user_type: string;
  is_active: boolean;
  organization_id: string | null;
  site_id: string | null;
  roles: string[];
  organization_name: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

/**
 * The session as the browser holds it: the bearer token plus the user it
 * belongs to. Reading the user from storage is a convenience for painting the
 * header on first load — it is not what grants access. The token is the only
 * thing the backend trusts, and it verifies the signature on every request, so
 * editing either of these by hand buys nothing.
 */

/** Notifies listeners in this tab; `storage` only fires in *other* tabs. */
const SESSION_CHANGED = "spicework:session-changed";

const emitChange = () => window.dispatchEvent(new Event(SESSION_CHANGED));

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    /* Corrupt or from an older format — treat as no session. */
    return null;
  }
};

export const isAuthenticated = (): boolean => Boolean(getToken());

export const saveSession = ({ access_token, user }: AuthResponse): void => {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  emitChange();
};

export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  emitChange();
};

/** Subscribe to session changes from this tab and from others. */
export const onSessionChange = (listener: () => void): (() => void) => {
  window.addEventListener(SESSION_CHANGED, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SESSION_CHANGED, listener);
    window.removeEventListener("storage", listener);
  };
};

/** Display name for the header/sidebar — falls back to the address. */
export const displayName = (user: AuthUser): string =>
  [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email;
