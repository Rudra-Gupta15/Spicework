import { TrendingUp } from "lucide-react";

import { DonutChart } from "@/components/charts/DonutChart";
import { ProgressBar, SectionCard } from "@/components/ui";
import { COMPLIANCE } from "@/data/dashboard";

/** Compliance gauge + breakdown legend + progress against target. */
export const ComplianceCard = () => (
  <SectionCard title="Overall Compliance Score">
    <div className="flex flex-col items-center">
      <DonutChart
        segments={[COMPLIANCE.breakdown[0]]}
        total={100}
        size={150}
        thickness={14}
        gap={0}
        rounded
      >
        <div>
          <p className="text-[28px] leading-none font-bold text-status-online tabular-nums">
            {COMPLIANCE.score}%
          </p>
          <p className="mt-1 text-xs text-muted">Compliant</p>
        </div>
      </DonutChart>

      <span className="mt-4 inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-status-online">
        <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.4} />
        {COMPLIANCE.delta} vs last 7 days
      </span>
    </div>

    <ul className="mt-5 space-y-2.5">
      {COMPLIANCE.breakdown.map((item) => (
        <li key={item.id} className="flex items-center gap-2.5 text-sm">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="flex-1 text-heading">{item.label}</span>
          <span className="font-semibold text-heading tabular-nums">
            {item.value}%
          </span>
        </li>
      ))}
    </ul>

    <div className="mt-5 border-t border-line pt-4">
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>Target: {COMPLIANCE.target}%</span>
        <span>vs last 7 days</span>
      </div>
      <ProgressBar
        value={COMPLIANCE.score}
        label={`Compliance ${COMPLIANCE.score}% of ${COMPLIANCE.target}% target`}
      />
    </div>
  </SectionCard>
);
