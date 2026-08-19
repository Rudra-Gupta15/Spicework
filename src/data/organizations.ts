import { useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";

/* ── Organizations & sites — the real tenancy records ─────────────────────
   backend/routers/inventory_organizations.py. These back the launcher
   download dialog: an audit is filed against a company by matching the name
   recorded at download time, so the name has to come from this list rather
   than being typed, or it can never be reconciled. */

export interface Organization {
  id: string;
  name: string;
  is_active?: boolean;
}

export interface Site {
  id: string;
  organization_id: string;
  name: string;
  city: string | null;
  state?: string | null;
  country?: string | null;
  is_active?: boolean;
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

export const fetchOrganizations = async (): Promise<Organization[]> => {
  const data = await api.get<{ organizations: Organization[] }>("/api/organizations");
  return data.organizations ?? [];
};

export const fetchOrganizationSites = async (organizationId: string): Promise<Site[]> => {
  const data = await api.get<{ sites: Site[] }>(
    `/api/organizations/${encodeURIComponent(organizationId)}/sites`,
  );
  return data.sites ?? [];
};

/** Active organizations, alphabetical — the Company picker's options. */
export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    fetchOrganizations()
      .then((data) => {
        if (cancelled) return;
        setOrganizations(
          data
            .filter((entry) => entry.is_active !== false)
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load companies."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { organizations, isLoading, error };
};

/** Sites belonging to one organization. Empty (and idle) until one is chosen. */
export const useOrganizationSites = (organizationId: string | undefined) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!organizationId) {
      setSites([]);
      setError(undefined);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchOrganizationSites(organizationId)
      .then((data) => {
        if (!cancelled) setSites(data.filter((entry) => entry.is_active !== false));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load sites."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  return { sites, isLoading, error };
};

/** Distinct city names across a set of sites, alphabetical. */
export const citiesOf = (sites: Site[]): string[] =>
  [...new Set(sites.map((entry) => (entry.city ?? "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );

/** Site names within one city, alphabetical. */
export const sitesInCity = (sites: Site[], city: string): string[] =>
  sites
    .filter((entry) => (entry.city ?? "").trim() === city)
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
