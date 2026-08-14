import type { DeviceStatus } from "./hardware";

/** The two report families the page is split into. */
export type ReportCategory = "Hardware" | "Software";

/** One row of the report list — a system a report can be generated for. */
export interface ReportSystem {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  serialNumber: string;
  status: DeviceStatus;
  location: string;
  assignedTo: string;
  lastScan: string;
  /** Hardware: components found. Software: applications installed. */
  records: number;
}

/** One label/value pair in a report's summary block. */
export interface ReportSummaryField {
  label: string;
  value: string;
}

/**
 * A titled table inside a report. This is the only tabular shape the
 * feature knows about — the preview, the PDF and the workbook all render
 * it, so the three can never drift apart.
 */
export interface ReportSection {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
}

/** A generated report, independent of the format it is rendered into. */
export interface ReportPreview {
  /** Slug used for the download filename. */
  id: string;
  category: ReportCategory;
  title: string;
  subtitle: string;
  generatedOn: string;
  summary: ReportSummaryField[];
  sections: ReportSection[];
}

/** The formats the download menu offers. */
export type ReportFormat = "pdf" | "excel";
