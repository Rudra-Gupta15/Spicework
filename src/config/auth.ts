/**
 * The single account the portal accepts while real authentication is not wired
 * up. Until now the login form let any address through, so this narrows access
 * rather than widening it — but it is a demo gate, not security: the values
 * ship in the JavaScript bundle and anyone can read them. Replace with a call
 * to the backend's user store before this is exposed to anyone outside the
 * team. The key on `localStorage` is what keeps a refresh from bouncing the
 * user back to the login screen.
 */
export const DEMO_CREDENTIALS = {
  email: "ABCD@gmail.com",
  password: "123456",
} as const;

export const SESSION_KEY = "spicework.session";

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
