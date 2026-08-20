import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { AUTH_ROUTES, SESSION_KEY } from "@/config/auth";

/** Single place the app ends a session from (sidebar + header menu). */
export const useLogout = (): (() => void) => {
  const navigate = useNavigate();

  return useCallback(() => {
    /* Dropping the key is the whole session today. Swap for a token revoke
       once real authentication is wired up. */
    localStorage.removeItem(SESSION_KEY);
    navigate(AUTH_ROUTES.login, { replace: true });
  }, [navigate]);
};
