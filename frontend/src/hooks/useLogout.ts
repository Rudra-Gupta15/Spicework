import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { AUTH_ROUTES } from "@/config/auth";

/** Single place the app ends a session from (sidebar + header menu). */
export const useLogout = (): (() => void) => {
  const navigate = useNavigate();

  return useCallback(() => {
    // TODO: clear the session/token once auth is wired up.
    navigate(AUTH_ROUTES.login, { replace: true });
  }, [navigate]);
};
