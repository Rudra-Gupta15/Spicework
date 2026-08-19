import type { DateRange } from "@/lib/dateRange";

import type { DeviceStatus } from "./hardware";

/** The two report families the page is split into. */
export type ReportCategory = "Hardware" | "Software";

/**
 * Who a system report is meant for. Public is the default: a report the
 * whole team can pull. Private marks one somebody keeps to themselves —
 * a machine under investigation, a director laptop, a licence audit.
 */
export type ReportScope = "Public" | "Private";

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
  /** Who may pull this system report. */
  scope: ReportScope;
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

/**
 * Active values of the report list filter bar. The same dimensions serve
 * both tabs — a Hardware report and a Software report are generated for the
 * same systems, so narrowing that list is the same question either way.
 */
export interface ReportFilterState {
  search: string;
  type: string;
  status: string;
  manufacturer: string;
  /** "All Scopes", or one of the two — see `ReportScope`. */
  scope: string;
  /** When a scan last reached the system — "Unknown" drops out once set. */
  lastScan: DateRange;
}

/** The formats the download menu offers. */
export type ReportFormat = "pdf" | "excel";
