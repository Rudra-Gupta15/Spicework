import type { ReportFormat, ReportPreview } from "@/types/report";

import { downloadPdf } from "./pdf";
import { downloadXlsx } from "./xlsx";

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
