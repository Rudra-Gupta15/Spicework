import { useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";

import { AUTH_ROUTES } from "@/config/auth";
import {
  clearSession,
  getStoredUser,
  getToken,
  onSessionChange,
  type AuthUser,
} from "@/lib/authSession";

/* useSyncExternalStore needs a stable snapshot, and getStoredUser parses JSON
   into a new object each call — which would loop forever. The raw token string
   is the stable key: it only changes when the session does. */
const subscribe = (listener: () => void) => onSessionChange(listener);
const getSnapshot = () => getToken();

interface Auth {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
}

/** The signed-in user, kept in step across tabs and with the API client's
    automatic sign-out on an expired token. */
export const useAuth = (): Auth => {
  const navigate = useNavigate();
  const token = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const logout = useCallback(() => {
    /* The token is stateless, so there is nothing to revoke server-side —
       dropping it is the whole logout. */
    clearSession();
    navigate(AUTH_ROUTES.login, { replace: true });
  }, [navigate]);

  return {
    user: token ? getStoredUser() : null,
    isAuthenticated: Boolean(token),
    logout,
  };
};
