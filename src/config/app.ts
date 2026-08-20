/** Footer shown at the bottom of the authenticated app. */
export const APP_FOOTER = {
  copyright: `© ${new Date().getFullYear()} Spicework Technologies Inc. All rights reserved.`,
  links: [
    { id: "privacy", label: "Privacy Policy", path: "/settings" },
    { id: "terms", label: "Terms of Service", path: "/settings" },
    { id: "help", label: "Help", path: "/settings" },
  ],
} as const;
