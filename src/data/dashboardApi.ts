import { useEffect, useState } from "react";
import { Building2, MapPin, Monitor, UserRound } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import type { DeviceAudit } from "@/types/dashboard";
import type { DashboardTile } from "./adminDashboard";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

/* GET /api/dashboard/stats — backend/routers/dashboard.py. */
export interface DashboardStats {
  sites: number;
  users: number;
  cities: number;
  devices: number;
}

const fetchDashboardStats = () => api.get<DashboardStats>("/api/dashboard/stats");

const toTiles = (stats: DashboardStats): DashboardTile[] => [
  {
    id: "sites",
    label: "Total Sites",
    value: stats.sites.toString(),
    hint: "Offices and delivery centres",
    icon: MapPin,
    to: "/dashboard/sites",
  },
  {
    id: "users",
    label: "Total Users",
    value: stats.users.toLocaleString(),
    hint: "People with access to the portal",
    icon: UserRound,
    to: "/dashboard/users",
  },
  {
    id: "devices",
    label: "Total Devices",
    value: stats.devices.toLocaleString(),
    hint: "Discovered across every site",
    icon: Monitor,
    to: "/inventory/hardware",
  },
  {
    id: "cities",
    label: "Cities Covered",
    value: stats.cities.toString(),
    hint: "Cities the sites are spread across",
    icon: Building2,
    to: "/dashboard/cities",
  },
];

/** The Dashboard page's 4 stat tiles, from real org/site/user/device counts. */
export const useDashboardTiles = () => {
  const [tiles, setTiles] = useState<DashboardTile[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) setTiles(toTiles(data));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load dashboard stats."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { tiles, isLoading, error };
};

/* GET /api/dashboard/recent-audits */
interface RawRecentAudit {
  id: string;
  device: string;
  ip: string;
  os: string;
  audited_on: string;
  current_user: string;
  antivirus: string;
  firewall: string;
  license_status: string;
  software_count: number;
}

const toDeviceAudit = (raw: RawRecentAudit): DeviceAudit => ({
  id: raw.id,
  device: raw.device,
  ip: raw.ip,
  os: raw.os,
  auditedOn: raw.audited_on,
  currentUser: raw.current_user,
  antivirus: raw.antivirus,
  firewall: raw.firewall,
  licenseStatus: raw.license_status,
  softwareCount: raw.software_count,
});

const fetchRecentAudits = async (limit: number): Promise<DeviceAudit[]> => {
  const data = await api.get<{ audits: RawRecentAudit[] }>(`/api/dashboard/recent-audits?limit=${limit}`);
  return data.audits.map(toDeviceAudit);
};

/* GET /api/dashboard/compliance-summary — backend/legacy_db.py's get_compliance_summary(). */
export interface ComplianceSummary {
  total: number;
  firewall: { enabled: number; disabled: number; unknown: number };
  antivirus: { protected: number; unprotected: number };
  license: { licensed: number; unlicensed: number; unknown: number };
}

const fetchComplianceSummary = () =>
  api.get<ComplianceSummary>("/api/dashboard/compliance-summary");

/** Firewall/Antivirus/License breakdown across every real device — backs the
    Dashboard's compliance chart, aggregated across the whole estate rather
    than just the handful shown in the Recent Device Audits card. */
export const useComplianceSummary = () => {
  const [summary, setSummary] = useState<ComplianceSummary>();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    fetchComplianceSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load the compliance summary."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, isLoading, error };
};

/** The "Recent Device Audits" card's rows — most recently audited real devices. */
export const useRecentAudits = (limit = 5) => {
  const [audits, setAudits] = useState<DeviceAudit[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    fetchRecentAudits(limit)
      .then((data) => {
        if (!cancelled) setAudits(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load recent audits."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { audits, isLoading, error };
};
