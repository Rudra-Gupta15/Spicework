import {
  Badge,
  Card,
  DataTable,
  ProgressBar,
  type Column,
} from "@/components/ui";
import { downloadText } from "@/lib/download";
import {
  INVOICES,
  resourceUsage,
  SUBSCRIPTION,
  type Invoice,
} from "@/data/settings";

const columns: Column<Invoice>[] = [
  { key: "date", header: "Date", cellClassName: "font-semibold text-heading" },
  { key: "description", header: "Description", cellClassName: "text-muted" },
  { key: "amount", header: "Amount", cellClassName: "font-semibold" },
  {
    key: "status",
    header: "Status",
    render: (invoice) => <Badge tone="success">{invoice.status}</Badge>,
  },
  {
    key: "invoice",
    header: "Invoice",
    align: "right",
    render: (invoice) => (
      <button
        type="button"
        onClick={() =>
          downloadText(
            `invoice-${invoice.date.replace(/[ ,]+/g, "-")}.txt`,
            `Spiceworks Invoice\n${invoice.date}\n${invoice.description}\nAmount: ${invoice.amount}\nStatus: ${invoice.status}\n`,
          )
        }
        className="font-semibold text-brand transition-colors hover:text-brand-600 focus-visible:outline-none"
      >
        Download
      </button>
    ),
  },
];

/** The Billing category: current plan, resource usage and invoice history. */
export const BillingSettings = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">
          Current Subscription
        </h2>

        <div className="mt-4 flex flex-wrap gap-x-16 gap-y-4 border-b border-line pb-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
              Plan Name
            </p>
            <p className="mt-1 text-xl font-bold text-heading">
              {SUBSCRIPTION.plan}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
              Subscription Rate
            </p>
            <p className="mt-1 text-xl font-bold text-heading">
              {SUBSCRIPTION.rate}{" "}
              <span className="text-sm font-normal text-muted">
                / {SUBSCRIPTION.period}
              </span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold text-heading">
          Plan Inclusions:
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
          {SUBSCRIPTION.inclusions.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-navy-300"
              />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="h-fit px-5 py-5">
        <h2 className="text-base font-bold text-heading">Resource Usage</h2>

        <div className="mt-4 space-y-4">
          {resourceUsage().map((resource) => (
            <div key={resource.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-heading">
                  {resource.label}
                </p>
                <span className="text-sm font-bold text-heading tabular-nums">
                  {resource.display}
                </span>
              </div>
              <ProgressBar
                className="mt-2"
                value={resource.pct}
                color="var(--color-brand)"
                label={`${resource.label}: ${resource.display}`}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>

    <Card className="px-5 py-5">
      <DataTable
        columns={columns}
        rows={INVOICES}
        rowKey={(invoice) => invoice.id}
        uppercaseHeaders
        bordered
        emptyMessage="No invoices yet."
      />
    </Card>
  </div>
);
