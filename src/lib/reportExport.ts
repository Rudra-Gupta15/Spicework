import type { ReportFormat, ReportPreview } from "@/types/report";

import { downloadPdf, type PdfTable } from "./pdf";
import { downloadXlsx, type XlsxSheet } from "./xlsx";

/** `Hardware Report — ASUS ROG` -> `hardware-report-asus-rog`. */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const filename = (report: ReportPreview, extension: string): string =>
  `${slugify(report.title)}.${extension}`;

const exportPdf = (report: ReportPreview): void =>
  downloadPdf(filename(report, "pdf"), {
    title: report.title,
    subtitle: report.subtitle,
    meta: [
      `Generated on ${report.generatedOn}`,
      `Report type: ${report.category} inventory report`,
    ],
    summary: report.summary.map((field) => [field.label, field.value]),
    tables: report.sections.map((section) => ({
      title: section.title,
      columns: section.columns,
      rows: section.rows,
    })),
  });

const exportExcel = (report: ReportPreview): void =>
  downloadXlsx(filename(report, "xlsx"), [
    {
      name: "Summary",
      rows: [
        ["Field", "Value"],
        ["Report", report.title],
        ["Type", `${report.category} inventory report`],
        ["Generated On", report.generatedOn],
        ...report.summary.map((field) => [field.label, field.value]),
      ],
    },
    ...report.sections.map((section) => ({
      name: section.title,
      rows: [section.columns, ...section.rows],
    })),
  ]);

/** Renders the report in the chosen format and starts the download. */
export const downloadReport = (
  report: ReportPreview,
  format: ReportFormat,
): void => (format === "pdf" ? exportPdf(report) : exportExcel(report));

/* --- several systems in one file ------------------------------------ */

const combinedTitle = (reports: ReportPreview[]): string =>
  `${reports[0].category} Report — ${reports.length} Systems`;

/**
 * A PDF is read front to back, so the systems stay in chapters: a contents
 * table, then every system's summary and tables under its own name. Each
 * table keeps the columns it has in a single-system report, so nothing is
 * squeezed to make room for a system column.
 */
const exportPdfCombined = (reports: ReportPreview[]): void => {
  const title = combinedTitle(reports);

  const contents: PdfTable = {
    title: "Systems Included",
    columns: ["#", "System", "Report"],
    rows: reports.map((report, index) => [
      (index + 1).toString(),
      report.subject,
      report.subtitle,
    ]),
  };

  const perSystem = reports.flatMap((report): PdfTable[] => [
    {
      title: `${report.subject} — Summary`,
      columns: ["Field", "Value"],
      rows: report.summary.map((field) => [field.label, field.value]),
    },
    ...report.sections.map((section) => ({
      title: `${report.subject} — ${section.title}`,
      columns: section.columns,
      rows: section.rows,
    })),
  ]);

  downloadPdf(`${slugify(title)}.pdf`, {
    title,
    subtitle: reports.map((report) => report.subject).join(" · "),
    meta: [
      `Generated on ${reports[0].generatedOn}`,
      `Report type: ${reports[0].category} inventory report`,
      `Systems included: ${reports.length}`,
    ],
    tables: [contents, ...perSystem],
  });
};

/**
 * A workbook is sorted and filtered, so the systems are stacked instead:
 * one sheet per section with a leading System column, which is the shape
 * that lets every machine's applications be compared in one place.
 */
const exportExcelCombined = (reports: ReportPreview[]): void => {
  /* Summary labels are fixed per category, but a system missing one must
     not shift the others — so the header is the union, in first-seen
     order, and each row is looked up by label. */
  const labels: string[] = [];
  reports.forEach((report) =>
    report.summary.forEach((field) => {
      if (!labels.includes(field.label)) labels.push(field.label);
    }),
  );

  const summarySheet: XlsxSheet = {
    name: "Summary",
    rows: [
      ["System", ...labels],
      ...reports.map((report) => [
        report.subject,
        ...labels.map(
          (label) =>
            report.summary.find((field) => field.label === label)?.value ?? "",
        ),
      ]),
    ],
  };

  /* Sections carry the same id across systems, so they merge onto one
     sheet — keyed by id, ordered by where each first appeared. */
  const merged = new Map<string, XlsxSheet>();

  reports.forEach((report) =>
    report.sections.forEach((section) => {
      const sheet = merged.get(section.id);
      const rows = section.rows.map((row) => [report.subject, ...row]);

      if (sheet) sheet.rows.push(...rows);
      else
        merged.set(section.id, {
          name: section.title,
          rows: [["System", ...section.columns], ...rows],
        });
    }),
  );

  downloadXlsx(`${slugify(combinedTitle(reports))}.xlsx`, [
    summarySheet,
    ...merged.values(),
  ]);
};

/**
 * Renders every picked system into a single file. One system falls back to
 * the plain single-system export, so a selection of one downloads exactly
 * what opening that system and downloading would.
 */
export const downloadReports = (
  reports: ReportPreview[],
  format: ReportFormat,
): void => {
  if (reports.length === 0) return;
  if (reports.length === 1) {
    downloadReport(reports[0], format);
    return;
  }

  if (format === "pdf") exportPdfCombined(reports);
  else exportExcelCombined(reports);
};
