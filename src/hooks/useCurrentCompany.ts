import { useMemo } from "react";

import { CURRENT_COMPANY, type CurrentCompany } from "@/config/company";
import { useAuth } from "@/hooks/useAuth";

/** `ORGANIZATION_ADMIN` → `Organization Admin`. */
const humanizeRole = (role: string): string =>
  role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * Who the header and sidebar name. Now that a login identifies a real user in
 * PostgreSQL, that user's own organization and role are what should show —
 * CURRENT_COMPANY stays as the fallback shape and still backs the demo data
 * the rest of the app is built on.
 */
export const useCurrentCompany = (): CurrentCompany => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return CURRENT_COMPANY;

    const domain = user.email.split("@")[1] ?? CURRENT_COMPANY.domain;

    return {
      ...CURRENT_COMPANY,
      id: user.organization_id ?? CURRENT_COMPANY.id,
      name: user.organization_name ?? CURRENT_COMPANY.name,
      domain,
      accountType: user.roles.length
        ? humanizeRole(user.roles[0])
        : CURRENT_COMPANY.accountType,
      email: user.email,
    };
  }, [user]);
};
