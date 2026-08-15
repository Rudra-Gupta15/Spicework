/** Auth route paths, kept in one place so links never drift. */
export const AUTH_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  register: "/register",
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
