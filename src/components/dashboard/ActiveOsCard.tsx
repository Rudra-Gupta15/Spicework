import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { DonutChart } from "@/components/charts/DonutChart";
import { SectionCard } from "@/components/ui";
import { OS_BREAKDOWN } from "@/data/dashboard";

/** OS mix donut with an accompanying table view (identity never colour-alone). */
export const ActiveOsCard = () => (
  <SectionCard title="Active OS">
    <div className="flex justify-center">
      <DonutChart segments={OS_BREAKDOWN.rows} size={150} thickness={18}>
        <div>
          <p className="text-lg font-bold text-heading tabular-nums">
            {OS_BREAKDOWN.total}
          </p>
          <p className="text-[11px] text-muted">Total</p>
        </div>
      </DonutChart>
    </div>

    <table className="mt-5 w-full text-sm">
      <thead>
        <tr className="border-b border-line text-xs text-muted">
          <th scope="col" className="pb-2 text-left font-medium">
            Type
          </th>
          <th scope="col" className="pb-2 text-right font-medium">
            Devices
          </th>
          <th scope="col" className="pb-2 text-right font-medium">
            %
          </th>
        </tr>
      </thead>
      <tbody>
        {OS_BREAKDOWN.rows.map((row) => (
          <tr key={row.id}>
            <td className="py-1.5">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                  aria-hidden="true"
                />
                <span className="text-heading">{row.label}</span>
              </span>
            </td>
            <td className="py-1.5 text-right font-semibold text-heading tabular-nums">
              {row.value}
            </td>
            <td className="py-1.5 text-right text-muted tabular-nums">
              {row.share}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="mt-5 border-t border-line pt-4">
      <Link
        to="/inventory/hardware"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-status-info hover:underline"
      >
        View all asset inventory
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </Link>
    </div>
  </SectionCard>
);
