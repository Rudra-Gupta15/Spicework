import type { ImportField, ImportRow } from "@/types/bulkImport";

import { CURRENT_COMPANY } from "@/config/company";

import {
  ADMIN_ROLE_OPTIONS,
  addUser,
  findSiteByName,
  findUserByEmail,
  siteOptions,
  updateUser,
} from "./admin";

/**
 * Users, as a bulk upload sees them.
 *
 * Inviting people one dialog at a time does not scale past a handful, so a
 * spreadsheet can be uploaded instead — and the same file can be sent back
 * later to move a team between sites or change what they are allowed to do.
 * Every row is checked against the rules the invite dialog enforces.
 */

/** What a row without a role becomes — the least privileged working role. */
const DEFAULT_ROLE = "Technician";

/** The approved shape of a user file, in template order. */
export const userImportFields = (): ImportField[] => [
  {
    key: "name",
    label: "Name",
    type: "text",
    group: "Identity",
    required: true,
    aliases: ["full name", "employee name"],
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    group: "Identity",
    required: true,
    identifier: true,
    aliases: ["email address", "work email", "sign-in address"],
    hint: "How a row is matched to somebody already on the roster",
  },
  {
    key: "role",
    label: "Role",
    type: "enum",
    group: "Access",
    options: ADMIN_ROLE_OPTIONS,
    fallback: DEFAULT_ROLE,
    aliases: ["portal role", "access level"],
  },
  {
    key: "site",
    label: "Site",
    type: "enum",
    group: "Access",
    required: true,
    options: siteOptions(),
    aliases: ["office", "branch", "location"],
  },
];

export const userExists = (email: string): boolean =>
  findUserByEmail(email) !== undefined;

/**
 * Nothing a single column can settle on its own is left, so this only holds
 * the line that the roster cannot lose its last administrator by file.
 */
export const checkUserRow = (
  values: Record<string, string>,
): string | undefined => {
  const site = values.site ?? "";

  /* The engine has already refused an unknown name; this catches a site
     removed between the preview and the run. */
  if (site !== "" && !findSiteByName(site)) return `Unknown site "${site}".`;

  return undefined;
};

/** Writes one checked row; a message fails just this row. */
export const commitUserRow = (row: ImportRow): string | undefined => {
  const { values } = row;
  const site = values.site ? findSiteByName(values.site) : undefined;

  if (row.action === "update") {
    const user = findUserByEmail(values.email ?? "");
    if (!user) return "That person is no longer on the roster.";

    updateUser(user.id, {
      name: values.name || undefined,
      role: values.role || undefined,
      siteId: site?.id,
    });

    return undefined;
  }

  if (!site) return `Unknown site "${values.site ?? ""}".`;
  if (userExists(values.email ?? ""))
    return "Somebody else claimed that address while this file was running.";

  const user = addUser({
    name: values.name,
    email: values.email,
    role: values.role || DEFAULT_ROLE,
    siteId: site.id,
  });

  return user ? undefined : "The invite could not be created.";
};

/** Example rows for the downloadable template, on this org's real sites. */
export const userImportTemplate = (): string[][] => {
  const sites = siteOptions();
  const domain = CURRENT_COMPANY.domain;

  return [
    ["Priya Sharma", `priya.sharma@${domain}`, "Technician", sites[0] ?? ""],
    ["Rahul Verma", `rahul.verma@${domain}`, "IT Manager", sites[1] ?? sites[0] ?? ""],
    ["Aisha Khan", `aisha.khan@${domain}`, "Help Desk Agent", sites[0] ?? ""],
  ];
};
