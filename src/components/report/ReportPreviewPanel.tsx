import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2 } from "lucide-react";

import { Badge, Button, Card, DataTable, PRIMARY_CELL, Select, type Column } from "@/components/ui";
import type {
  ReportFormat,
  ReportPreview,
  ReportScope,
  ReportSection,
} from "@/types/report";

import { ReportDownloadMenu } from "./ReportDownloadMenu";

/** A preview stays skimmable; the download always carries every row. */
const PREVIEW_ROWS = 10;

const FORMAT_LABEL: Record<ReportFormat, string> = {
  pdf: "PDF",
  excel: "Excel workbook",
};

/** Columns for a section's `string[]` rows, keyed by position. */
const sectionColumns = (section: ReportSection): Column<string[]>[] =>
  section.columns.map((header, index) => ({
    key: `${section.id}-${index}`,
    header,
    wrap: header === "Value" || header === "Specification",
    cellClassName: index === 0 ? PRIMARY_CELL : "text-muted",
    render: (row) => row[index] ?? "—",
  }));

/** The two things a report can be, as the picker lists them. */
const SCOPE_OPTIONS: readonly string[] = ["Public", "Private"];

interface ReportPreviewPanelProps {
  report: ReportPreview;
  /** Who this report is for — Public unless somebody said otherwise. */
  scope: ReportScope;
  onScopeChange: (scope: ReportScope) => void;
  /** Returns to the system list. */
  onBack: () => void;
  onDownload: (format: ReportFormat) => void;
}

/** The generated report as it appears on screen, before it is downloaded. */
export const ReportPreviewPanel = ({
  report,
  scope,
  onScopeChange,
  onBack,
  onDownload,
}: ReportPreviewPanelProps) => {
  /* Tagged with the report it belongs to, so picking another system drops
     the confirmation without an effect resetting it. */
  const [receipt, setReceipt] = useState<{
    reportId: string;
    format: ReportFormat;
  } | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* The confirmation is transient, and must not outlive the panel. */
  useEffect(() => () => clearTimeout(timer.current), []);

  const downloaded = receipt?.reportId === report.id ? receipt.format : null;

  const handleDownload = (format: ReportFormat) => {
    onDownload(format);
    setReceipt({ reportId: report.id, format });

    clearTimeout(timer.current);
    timer.current = setTimeout(() => setReceipt(null), 5000);
  };

  const columnsBySection = useMemo(
    () => new Map(report.sections.map((section) => [section.id, sectionColumns(section)])),
    [report.sections],
  );

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-heading">{report.title}</h2>
            <Badge tone="brand">{report.category} Report</Badge>
            <Badge tone={scope === "Private" ? "neutral" : "success"}>
              {scope}
            </Badge>
          </div>

          <p className="mt-1.5 text-sm text-muted">{report.subtitle}</p>

          <p className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] text-muted">
            <CalendarClock className="h-4 w-4" strokeWidth={2} />
            Generated on {report.generatedOn}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Who may pull this report. Changing it takes effect on the
                list behind straight away — nothing else to save. */}
            <Select
              label="Scope:"
              aria-label="Who this report is for"
              align="right"
              options={SCOPE_OPTIONS}
              value={scope}
              onChange={(next) => onScopeChange(next as ReportScope)}
            />

            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.2} />}
              onClick={onBack}
            >
              Back to list
            </Button>

            <ReportDownloadMenu onDownload={handleDownload} />
          </div>

          <p
            role="status"
            aria-live="polite"
            className="h-4 text-[12px] font-semibold text-status-online"
          >
            {downloaded && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                {FORMAT_LABEL[downloaded]} downloaded
              </span>
            )}
          </p>
        </div>
      </Card>

      <Card className="px-5 py-5">
        <h3 className="text-base font-bold text-heading">Report Summary</h3>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          {report.summary.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
                {field.label}
              </dt>
              <dd className="mt-1.5 text-[13px] leading-relaxed break-words text-heading">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {report.sections.map((section) => {
        const hidden = section.rows.length - PREVIEW_ROWS;

        return (
          <Card key={section.id} className="px-5 py-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-heading">{section.title}</h3>
              <span className="text-[13px] text-muted">
                {section.rows.length} records
              </span>
            </div>

            <DataTable
              columns={columnsBySection.get(section.id) ?? []}
              rows={section.rows.slice(0, PREVIEW_ROWS)}
              rowKey={(row) => `${section.id}-${row[0]}-${row[1]}`}
              bordered
              dense
              uppercaseHeaders
            />

            {hidden > 0 && (
              <p className="mt-3 text-[13px] text-muted">
                Previewing the first {PREVIEW_ROWS} of {section.rows.length}{" "}
                records — the downloaded report contains all of them.
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
};
