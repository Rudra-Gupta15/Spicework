import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Pencil } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  Checkbox,
  DataTable,
  PRIMARY_CELL,
  Select,
  type Column,
} from "@/components/ui";
import { ManualBadge } from "@/components/common/ManualBadge";
import { HARDWARE_SECTION_EDIT_CONFIG, SECTION_IDENTITY_COLUMN } from "@/data/report";
import type {
  ReportFormat,
  ReportPreview,
  ReportScope,
  ReportSection,
} from "@/types/report";

import {
  EditHardwareSpecModal,
  type HardwareSpecFields,
} from "./EditHardwareSpecModal";
import { EditSectionRowsModal } from "./EditSectionRowsModal";
import { ReportDownloadMenu } from "./ReportDownloadMenu";

/** The "Hardware Specification" section's rows, in the exact order and
    labels `mapHardwareFields` produces them in — how the edit form reads
    the section's current values back out without needing the raw detail
    object this panel otherwise has no reason to hold. */
const SPEC_LABELS: Record<keyof HardwareSpecFields, string> = {
  cpu: "Processor (CPU)",
  ram: "Memory (RAM)",
  disk: "Disk",
  serialNumber: "Serial Number",
  manufacturer: "Manufacturer",
  model: "Model",
};

const specFieldsFrom = (section: ReportSection | undefined): HardwareSpecFields => {
  const byLabel = new Map(section?.rows.map(([label, value]) => [label, value]));
  return {
    cpu: byLabel.get(SPEC_LABELS.cpu) ?? "",
    ram: byLabel.get(SPEC_LABELS.ram) ?? "",
    disk: byLabel.get(SPEC_LABELS.disk) ?? "",
    serialNumber: byLabel.get(SPEC_LABELS.serialNumber) ?? "",
    manufacturer: byLabel.get(SPEC_LABELS.manufacturer) ?? "",
    model: byLabel.get(SPEC_LABELS.model) ?? "",
  };
};

/** A preview stays skimmable; the download always carries every row. */
const PREVIEW_ROWS = 10;

const FORMAT_LABEL: Record<ReportFormat, string> = {
  pdf: "PDF",
  excel: "Excel workbook",
};

/**
 * Columns for a section's `string[]` rows, keyed by position. The identity
 * column (see `SECTION_IDENTITY_COLUMN`) gets a `ManualBadge` on any row
 * whose key appears in `section.correctedRowKeys` — everywhere else just
 * prints the cell.
 */
const sectionColumns = (section: ReportSection): Column<string[]>[] => {
  const identityColumn = SECTION_IDENTITY_COLUMN[section.id];
  const identityIndex = identityColumn ? section.columns.indexOf(identityColumn) : -1;

  return section.columns.map((header, index) => ({
    key: `${section.id}-${index}`,
    header,
    wrap: header === "Value" || header === "Specification",
    cellClassName: index === 0 ? PRIMARY_CELL : "text-muted",
    render: (row) => {
      const value = row[index] ?? "—";
      if (index !== identityIndex) return value;

      const corrected = section.correctedRowKeys?.includes(row[identityIndex]);
      return corrected ? (
        <span className="inline-flex items-center">
          {value}
          <ManualBadge />
        </span>
      ) : (
        value
      );
    },
  }));
};

/** The two things a report can be, as the picker lists them. */
const SCOPE_OPTIONS: readonly string[] = ["Public", "Private"];

interface ReportPreviewPanelProps {
  report: ReportPreview;
  /** Who this report is for — Public unless somebody said otherwise. */
  scope: ReportScope;
  onScopeChange: (scope: ReportScope) => void;
  /** Returns to the system list. */
  onBack: () => void;
  /** `sectionIds` is the picked subset — see `reportWithSections`. */
  onDownload: (format: ReportFormat, sectionIds: string[]) => void;
  /** Saves a Hardware Specification correction and refreshes the report so
      it shows immediately. Absent on a Software report, which has no
      specification section to correct. */
  onEditSpecification?: (overrides: Partial<HardwareSpecFields>) => Promise<unknown>;
  /** Saves corrected rows for a list section (`section.id`) and refreshes
      the report. Absent on a Software report — none of its sections have a
      row-edit config, so the pencil never renders regardless. */
  onEditSection?: (
    sectionId: string,
    updates: { rowKey: string; fields: Record<string, string> }[],
  ) => Promise<unknown>;
}

/** The generated report as it appears on screen, before it is downloaded. */
export const ReportPreviewPanel = ({
  report,
  scope,
  onScopeChange,
  onBack,
  onDownload,
  onEditSpecification,
  onEditSection,
}: ReportPreviewPanelProps) => {
  const [editingSpec, setEditingSpec] = useState(false);
  /* The row section currently open for correction — `null` while closed. */
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
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

  /* Which sections come along on the next download — everything, until
     someone unchecks one. Reset to "everything" whenever a different
     system's report loads, the same way `receipt` is tagged rather than
     cleared by an effect: derived during render so a stale selection from
     the last system never paints for even one frame. */
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    () => new Set(report.sections.map((section) => section.id)),
  );
  const [selectedFor, setSelectedFor] = useState(report.id);
  if (selectedFor !== report.id) {
    setSelectedFor(report.id);
    setSelectedSections(new Set(report.sections.map((section) => section.id)));
  }

  const toggleSection = (id: string, checked: boolean) => {
    setSelectedSections((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const allSelected = selectedSections.size === report.sections.length;
  const selectAll = () =>
    setSelectedSections(new Set(report.sections.map((section) => section.id)));
  const selectNone = () => setSelectedSections(new Set());

  const handleDownload = (format: ReportFormat) => {
    onDownload(format, [...selectedSections]);
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

            <ReportDownloadMenu
              onDownload={handleDownload}
              disabled={selectedSections.size === 0}
            />
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
              <dd className="mt-1.5 text-[13px] leading-relaxed wrap-break-word text-heading">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Which parts the download will actually carry — Report Summary
          always comes along (see `reportWithSections`), so the picker only
          covers the sections below it. */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-[13px] text-muted">
          {selectedSections.size} of {report.sections.length} sections selected
          for download
        </p>
        <div className="flex items-center gap-3 text-[13px] font-semibold text-brand">
          <button
            type="button"
            onClick={selectAll}
            disabled={allSelected}
            className="rounded transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={selectNone}
            disabled={selectedSections.size === 0}
            className="rounded transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            Select none
          </button>
        </div>
      </div>

      {report.sections.map((section) => {
        const hidden = section.rows.length - PREVIEW_ROWS;
        const included = selectedSections.has(section.id);

        return (
          <Card
            key={section.id}
            className={`px-5 py-5 transition-opacity ${included ? "" : "opacity-60"}`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={included}
                  onChange={(checked) => toggleSection(section.id, checked)}
                  label={`Include ${section.title} in the download`}
                  hideLabel
                />
                <h3 className="text-base font-bold text-heading">{section.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-muted">
                  {section.rows.length} records
                </span>
                {section.id === "specification" && onEditSpecification && (
                  <button
                    type="button"
                    onClick={() => setEditingSpec(true)}
                    title="Correct a field the agent misread"
                    className="inline-flex rounded-md p-1 text-navy-300 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    <span className="sr-only">Correct Hardware Specification</span>
                  </button>
                )}
                {section.id !== "specification" &&
                  onEditSection &&
                  HARDWARE_SECTION_EDIT_CONFIG[section.id] && (
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(section.id)}
                      title={`Correct a row the agent misread in ${section.title}`}
                      className="inline-flex rounded-md p-1 text-navy-300 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      <span className="sr-only">Correct {section.title}</span>
                    </button>
                  )}
              </div>
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

      {onEditSpecification && (
        <EditHardwareSpecModal
          isOpen={editingSpec}
          onClose={() => setEditingSpec(false)}
          current={specFieldsFrom(report.sections.find((section) => section.id === "specification"))}
          onSave={onEditSpecification}
        />
      )}

      {onEditSection && (
        <EditSectionRowsModal
          isOpen={editingSectionId !== null}
          onClose={() => setEditingSectionId(null)}
          section={report.sections.find((section) => section.id === editingSectionId)}
          config={editingSectionId ? HARDWARE_SECTION_EDIT_CONFIG[editingSectionId] : undefined}
          onSave={(updates) => onEditSection(editingSectionId ?? "", updates)}
        />
      )}
    </div>
  );
};
