import { Suspense, lazy, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PagePlaceholder } from "@/components/common/PagePlaceholder";
import { AUTH_ROUTES } from "@/config/auth";
import { NAVIGATION } from "@/config/navigation";
import AppLayout from "@/layout";
import AuthLayout from "@/layout/AuthLayout";

const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const HardwarePage = lazy(() => import("@/pages/Hardware"));
const LoginPage = lazy(() => import("@/pages/Login"));
const AuthComingSoon = lazy(() => import("@/pages/AuthComingSoon"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

/**
 * Pages that already have real content. Everything else in the navigation
 * config falls back to <PagePlaceholder /> — so adding a nav entry never
 * produces a dead link.
 */
const PAGES: Record<string, ComponentType> = {
  "/dashboard": DashboardPage,
  "/inventory/hardware": HardwarePage,
};

/** Flattened `{ path, label }` list derived from the navigation config. */
const ROUTE_ENTRIES = NAVIGATION.flatMap((item) => [
  ...(item.path ? [{ path: item.path, label: item.label }] : []),
  ...(item.children ?? []).map((child) => ({
    path: child.path,
    label: child.label,
  })),
]);

export const AppRoutes = () => (
  <Suspense fallback={null}>
    <Routes>
      <Route index element={<Navigate to={AUTH_ROUTES.login} replace />} />

      {/* Auth — split-screen shell, no sidebar */}
      <Route element={<AuthLayout />}>
        <Route path={AUTH_ROUTES.login} element={<LoginPage />} />
        <Route
          path={AUTH_ROUTES.forgotPassword}
          element={<AuthComingSoon title="Reset your password" />}
        />
        <Route
          path={AUTH_ROUTES.register}
          element={<AuthComingSoon title="Create your account" />}
        />
      </Route>

      {/* App — sidebar + page header shell */}
      <Route element={<AppLayout />}>
        {ROUTE_ENTRIES.map(({ path, label }) => {
          const Page = PAGES[path];
          return (
            <Route
              key={path}
              path={path}
              element={Page ? <Page /> : <PagePlaceholder name={label} />}
            />
          );
        })}

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </Suspense>
);
