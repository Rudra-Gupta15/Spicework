/**
 * Auth wiring for the portal. Credentials are checked by the backend against
 * the `users` table in PostgreSQL — nothing here decides who gets in, and no
 * password ever lives in the bundle.
 */

/** Where the signed JWT and the user it belongs to are kept between reloads. */
export const TOKEN_KEY = "spicework.token";
export const SESSION_KEY = "spicework.session";

/** Auth route paths, kept in one place so links never drift. */
export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
} as const;

/** Marketing copy shown on the left panel of the auth screens. */
export const AUTH_PANEL = {
  badge: "Enterprise IT Management",
  heading: "Manage your IT assets with absolute confidence.",
  description:
    "Track hardware lifecycles, monitor active licenses, manage deployments, and gain deep analytics through our centralized Spiceworks portal.",
  footer: {
    copyright: `© ${new Date().getFullYear()} Spiceworks, Inc.`,
    note: "Secure Tenant Access",
  },
} as const;
