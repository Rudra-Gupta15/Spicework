import { Link } from "react-router-dom";

import { Badge, Loader, SectionCard } from "@/components/ui";
import { useRecentAudits } from "@/data/dashboardApi";
import type { Tone } from "@/types/ui";

/** Cosmetic colour only — the badge always shows the exact raw text, this
    just picks which tone reads it in. */
const statusTone = (value: string): Tone => {
  const v = value.toLowerCase();
  const isLicensed = v.includes("licensed") && !v.includes("unlicensed");
  if (v.includes("enabled") || isLicensed) return "success";
  if (v.includes("disabled") || v.includes("unlicensed") || v.includes("unknown")) return "danger";
  return "neutral";
};

/** Link that opens the full list — reused by both list cards. */
const ViewAllLink = ({ to }: { to: string }) => (
  <Link
    to={to}
    className="text-sm font-semibold text-status-info hover:underline"
  >
    View All
  </Link>
);

/** One compact per-device summary — glanceable dashboard card, not a dense
    table: name + context on the left, compliance badges + drill-in on the
    right. */
export const RecentAuditsCard = () => {
  const { audits, isLoading, error } = useRecentAudits(5);

  return (
    <SectionCard title="Recent Device Audits" action={<ViewAllLink to="/log" />}>
      {error && (
        <p className="pb-3 text-[13px] text-status-offline">{error}</p>
      )}
      {isLoading ? (
        <Loader label="Loading recent audits…" className="py-6" />
      ) : audits.length === 0 ? (
        <p className="py-4 text-sm text-muted">No audits recorded yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {audits.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  to={`/inventory/hardware/${encodeURIComponent(row.id)}`}
                  className="font-semibold text-heading hover:text-status-info hover:underline"
                >
                  {row.device}
                </Link>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {row.os} · {row.ip} · {row.currentUser} · Audited {row.auditedOn}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(row.firewall)}>Firewall: {row.firewall}</Badge>
                <Badge tone={statusTone(row.licenseStatus)}>{row.licenseStatus}</Badge>
                <span className="text-xs text-muted">{row.softwareCount} apps</span>
                <Link
                  to={`/inventory/hardware/${encodeURIComponent(row.id)}`}
                  className="text-sm font-semibold text-status-info hover:underline"
                >
                  View Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};
