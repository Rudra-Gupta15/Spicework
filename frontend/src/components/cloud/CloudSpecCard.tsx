import { Card } from "@/components/ui";
import type { CloudDetailRow } from "@/types/cloud";

interface CloudSpecCardProps {
  title: string;
  rows: CloudDetailRow[];
}

/** Label/value list card — the contract and tenant panels on the detail screen. */
export const CloudSpecCard = ({ title, rows }: CloudSpecCardProps) => (
  <Card className="p-6">
    <h2 className="text-xl font-bold text-heading">{title}</h2>

    <dl className="mt-4">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-baseline justify-between gap-6 border-b border-line py-3"
        >
          <dt className="text-sm text-muted">{row.label}</dt>
          <dd className="text-right text-sm font-semibold text-heading">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  </Card>
);
