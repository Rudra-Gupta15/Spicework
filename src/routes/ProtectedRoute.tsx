import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AUTH_ROUTES } from "@/config/auth";
import { DEFAULT_ROUTE } from "@/config/navigation";
import { isAuthenticated } from "@/lib/authSession";

/**
 * The gate the app was missing: typing a protected URL straight into the
 * address bar now lands on the login screen instead of the page.
 *
 * This is a UI guard, not the security boundary — anyone can edit their own
 * localStorage. What actually protects the data is the backend rejecting any
 * /api/ request without a valid signed token, so a forged session here shows
 * an empty shell and nothing more.
 */
export const ProtectedRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    /* Where they were headed is remembered, so logging in resumes the trip
       rather than always dumping them on the dashboard. */
    return (
      <Navigate to={AUTH_ROUTES.login} replace state={{ from: location.pathname + location.search }} />
    );
  }

  return <Outlet />;
};

/** The mirror image: an already signed-in user has no use for the login or
    signup screens, so send them on to the app. */
export const PublicOnlyRoute = () => {
  if (isAuthenticated()) return <Navigate to={DEFAULT_ROUTE} replace />;
  return <Outlet />;
};
