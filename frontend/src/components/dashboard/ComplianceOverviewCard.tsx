import { useMemo } from "react";

import { ProgressBar, SectionCard } from "@/components/ui";
import { useComplianceSummary } from "@/data/dashboardApi";

interface Row {
  id: string;
  label: string;
  compliant: number;
  total: number;
  caption: string;
  color: string;
}

/**
 * Firewall / Antivirus / License compliance across every real device —
 * aggregated server-side (get_compliance_summary), not just the handful of
 * rows shown in Recent Device Audits. Every count is a raw field tally, same
 * "no fabricated score" rule as the rest of the Dashboard.
 */
export const ComplianceOverviewCard = () => {
  const { summary, isLoading, error } = useComplianceSummary();

  const rows = useMemo<Row[]>(() => {
    if (!summary) return [];
    return [
      {
        id: "firewall",
        label: "Firewall Enabled",
        compliant: summary.firewall.enabled,
        total: summary.total,
        caption: `${summary.firewall.disabled} disabled · ${summary.firewall.unknown} unknown`,
        color: "var(--color-status-online)",
      },
      {
        id: "antivirus",
        label: "Antivirus Protected",
        compliant: summary.antivirus.protected,
        total: summary.total,
        caption: `${summary.antivirus.unprotected} unprotected`,
        color: "var(--color-chart-1)",
      },
      {
        id: "license",
        label: "Licensed",
        compliant: summary.license.licensed,
        total: summary.total,
        caption: `${summary.license.unlicensed} unlicensed · ${summary.license.unknown} unknown`,
        color: "var(--color-chart-4)",
      },
    ];
  }, [summary]);

  return (
    <SectionCard title="Compliance Overview">
      {error && <p className="text-[13px] text-status-offline">{error}</p>}

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted">Loading compliance data…</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No audited devices yet.</p>
      ) : (
        <ul className="space-y-5">
          {rows.map((row) => {
            const share = row.total > 0 ? Math.round((row.compliant / row.total) * 100) : 0;
            return (
              <li key={row.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-heading">{row.label}</span>
                  <span className="font-semibold text-heading tabular-nums">
                    {row.compliant}/{row.total} ({share}%)
                  </span>
                </div>
                <ProgressBar value={share} color={row.color} label={row.label} />
                <p className="mt-1.5 text-xs text-muted">{row.caption}</p>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
};
