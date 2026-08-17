import type { ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PagePlaceholder } from "@/components/common/PagePlaceholder";
import { AUTH_ROUTES } from "@/config/auth";
import { NAVIGATION } from "@/config/navigation";
import AppLayout from "@/layout";
import AuthLayout from "@/layout/AuthLayout";

/**
 * Pages are imported eagerly. Code-splitting them meant the first visit to
 * a route had to fetch its chunk before anything could paint, which read
 * as the screen blanking and reloading; the whole app is small enough that
 * shipping it in one bundle is the better trade.
 */
import AdminCitiesPage from "@/pages/AdminCities";
import AdminOrganizationPage from "@/pages/AdminOrganization";
import AdminOrganizationEditPage from "@/pages/AdminOrganizationEdit";
import AdminSiteFormPage from "@/pages/AdminSiteForm";
import AdminSitesPage from "@/pages/AdminSites";
import AdminUsersPage from "@/pages/AdminUsers";
import AgentPage from "@/pages/Agent";
import AuthComingSoon from "@/pages/AuthComingSoon";
import DashboardPage from "@/pages/Dashboard";
import HardwarePage from "@/pages/Hardware";
import HardwareDetailPage from "@/pages/HardwareDetail";
import LogPage from "@/pages/Log";
import LoginPage from "@/pages/Login";
import NotFoundPage from "@/pages/NotFound";
import ReportPage from "@/pages/Report";
import SavedSearchPage from "@/pages/SavedSearch";
import SavedSearchDetailPage from "@/pages/SavedSearchDetail";
import SettingsPage from "@/pages/Settings";
import SoftwarePage from "@/pages/Software";
import SoftwareAssetsPage from "@/pages/SoftwareAssets";
import SoftwareDetailPage from "@/pages/SoftwareDetail";
import TicketPage from "@/pages/Ticket";
import TicketCreatePage from "@/pages/TicketCreate";
import TicketCreatedPage from "@/pages/TicketCreated";
import TicketDetailPage from "@/pages/TicketDetail";

/**
 * Pages that already have real content. Everything else in the navigation
 * config falls back to <PagePlaceholder /> — so adding a nav entry never
 * produces a dead link.
 */
const PAGES: Record<string, ComponentType> = {
  "/dashboard": DashboardPage,
  "/inventory/hardware": HardwarePage,
  "/inventory/software": SoftwarePage,
  "/reports": ReportPage,
  "/agent": AgentPage,
  "/saved-search": SavedSearchPage,
  "/log": LogPage,
  "/settings": SettingsPage,
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

      {/* Detail screens hang off their list route, so the sidebar entry
          stays active while they are open. */}

      {/* The admin area covers one organization, so nothing here is scoped
          by a parent id — Organization → Site → Users, straight down. */}
      <Route path="/dashboard/organization" element={<AdminOrganizationPage />} />
      <Route
        path="/dashboard/organization/edit"
        element={<AdminOrganizationEditPage />}
      />

      <Route path="/dashboard/users" element={<AdminUsersPage />} />

      {/* Cities are derived from the sites, so this is a rolled-up view of
          the same set rather than a list of its own records. */}
      <Route path="/dashboard/cities" element={<AdminCitiesPage />} />

      {/* Static segment is ranked above `:siteId`, so it wins. */}
      <Route path="/dashboard/sites" element={<AdminSitesPage />} />
      <Route path="/dashboard/sites/new" element={<AdminSiteFormPage />} />
      <Route path="/dashboard/sites/:siteId" element={<AdminSiteFormPage />} />

      <Route
        path="/inventory/hardware/:deviceId"
        element={<HardwareDetailPage />}
      />
      {/* Static segment is ranked above `:deviceId`, so it wins. */}
      <Route
        path="/inventory/software/assets"
        element={<SoftwareAssetsPage />}
      />
      <Route
        path="/inventory/software/:deviceId"
        element={<SoftwareDetailPage />}
      />
      {/* Ticket is hidden from the sidebar nav, so its list route is declared
          explicitly here (rather than generated from the nav) — this keeps the
          ticket pages and their "back to list" links working. */}
      <Route path="/inventory/ticket" element={<TicketPage />} />
      {/* Static segment is ranked above `:ticketId`, so it wins. */}
      <Route path="/inventory/ticket/new" element={<TicketCreatePage />} />
      <Route
        path="/inventory/ticket/:ticketId/created"
        element={<TicketCreatedPage />}
      />
      <Route
        path="/inventory/ticket/:ticketId"
        element={<TicketDetailPage />}
      />
      <Route
        path="/saved-search/:searchId"
        element={<SavedSearchDetailPage />}
      />

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
