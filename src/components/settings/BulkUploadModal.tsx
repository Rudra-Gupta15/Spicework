import { useEffect, useRef, useState, type ReactNode } from "react";
import { FileSpreadsheet } from "lucide-react";

import { Button, DataTable, Modal, type Column } from "@/components/ui";
import { useImportJob } from "@/hooks/useImportJob";
import {
  ACCEPTED_IMPORT_FILES,
  BULK_IMPORT_STEPS,
  MAX_IMPORT_FILE_MB,
  UNMAPPED,
  UNSCOPED_IMPORT_STEPS,
  type BulkImportStep,
  autoMapColumns,
  buildImportRows,
  buildImportTable,
  duplicateMappings,
  errorReport,
  mappingIssue,
  readImportTable,
  summarize,
  templateHeaders,
} from "@/lib/bulkImport";
import { downloadCsv } from "@/lib/csv";
import { readXlsx } from "@/lib/xlsxRead";
import type {
  ImportAction,
  ImportField,
  ImportMapping,
  ImportMode,
  ImportRow,
  ImportSummary,
  ImportTable,
} from "@/types/bulkImport";

import { BulkImportFileStep } from "./BulkImportFileStep";
import { BulkImportMapStep } from "./BulkImportMapStep";
import { BulkImportProgress } from "./BulkImportProgress";
import { BulkImportSteps } from "./BulkImportSteps";
import { BulkImportSummary } from "./BulkImportSummary";
import { BulkImportValidateStep } from "./BulkImportValidateStep";
import { importStatusColumn } from "./bulkImportColumns";

/** How many rows the preview puts on screen before it stops listing them. */
const PREVIEW_LIMIT = 50;

export interface BulkUploadModalProps {
  title: string;
  description: string;
  /** Singular / plural of what one row stands for — "User", "Asset". */
  noun: { one: string; many: string };
  /** The approved shape of the file, in template order. */
  fields: ImportField[];
  templateFilename: string;
  templateRows: () => string[][];
  /** How the preview identifies a row — the row number and verdict are added. */
  columns: Column<ImportRow>[];
  /** Whether a record with this identifier is already on the books. */
  exists: (identifier: string) => boolean;
  /** Rules the data type owns, beyond what a single column can settle. */
  check?: (
    values: Record<string, string>,
    action: ImportAction,
  ) => string | undefined;
  /** Writes one row; a returned message fails that row and no other. */
  commit: (row: ImportRow) => string | undefined;
  /** Fired each time a run finishes, so the caller can refresh what it shows. */
  onFinished: (summary: ImportSummary) => void;
  onClose: () => void;
  /** Extra copy under the column list — rules a data type wants spelled out. */
  requirements?: ReactNode;
  /**
   * A first step for narrowing the upload to records picked by hand. Assets
   * have one — the inventory to tick through; users have nothing to pick
   * from, so their dialog leaves this out and starts on Upload.
   */
  scope?: {
    /** The picker itself. */
    children: ReactNode;
    /** How many records are ticked — none means the file stands on its own. */
    count: number;
    /** One line in the file header once the step has been passed. */
    summary: string;
  };
}

/**
 * The shell behind every "Bulk Upload" dialog, and the whole of the import
 * flow: upload the file and say what it may do, correct how its columns map
 * onto the approved ones, read what the checks made of it, look at what each
 * row will do, then watch them being written a few at a time.
 *
 * Nothing is written before the preview has been confirmed, and a run that
 * leaves rows behind hands them back as a file — an import that half
 * succeeds should never be something to start over from.
 */
export const BulkUploadModal = ({
  title,
  description,
  noun,
  fields,
  templateFilename,
  templateRows,
  columns,
  exists,
  check,
  commit,
  onFinished,
  onClose,
  requirements,
  scope,
}: BulkUploadModalProps) => {
  const steps = scope ? BULK_IMPORT_STEPS : UNSCOPED_IMPORT_STEPS;

  const [step, setStep] = useState<BulkImportStep>(scope ? "Select" : "Upload");
  const [mode, setMode] = useState<ImportMode>("create");
  const [filename, setFilename] = useState("");
  const [table, setTable] = useState<ImportTable | null>(null);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [error, setError] = useState<string>();

  const job = useImportJob(commit);

  /* The caller hears about a run once it has finished, once per run — not
     once per repaint, and not again when a retry is only being considered. */
  const reported = useRef(0);

  useEffect(() => {
    if (job.state !== "done" && job.state !== "stopped") return;
    if (reported.current === job.run) return;

    reported.current = job.run;
    onFinished(summarize(job.rows));
  }, [job.state, job.run, job.rows, onFinished]);

  const previewColumns: Column<ImportRow>[] = [...columns, importStatusColumn()];

  const downloadTemplate = () =>
    downloadCsv(templateFilename, templateHeaders(fields), templateRows());

  /** Reads whichever of the two file kinds was handed over. */
  const readFile = async (file: File | undefined) => {
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!ACCEPTED_IMPORT_FILES.includes(extension)) {
      setError("That is not a CSV or XLSX file — export the sheet and try again.");
      return;
    }

    if (file.size > MAX_IMPORT_FILE_MB * 1024 * 1024) {
      setError(
        `That file is over ${MAX_IMPORT_FILE_MB} MB. Split it and upload the parts — each one reports on its own.`,
      );
      return;
    }

    let parsed: ImportTable;

    try {
      parsed =
        extension === ".xlsx"
          ? buildImportTable(await readXlsx(await file.arrayBuffer()), fields)
          : readImportTable(await file.text(), fields);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "That file could not be read.",
      );
      return;
    }

    if (parsed.body.length === 0) {
      setError(
        parsed.headers.length === 0
          ? "That file is empty."
          : "No rows found under the header — check the file has data.",
      );
      return;
    }

    setError(undefined);
    setFilename(file.name);
    setTable(parsed);
    setMapping(autoMapColumns(fields, parsed));
  };

  const issue = table ? mappingIssue(fields, mapping, mode) : undefined;
  const clashes = duplicateMappings(mapping).length > 0;

  /** Reads the mapped file into rows and says what each one would do. */
  const validate = () => {
    if (!table || issue || clashes) return;

    setRows(buildImportRows({ fields, table, mapping, mode, exists, check }));
    setStep("Validate");
  };

  const startAgain = () => {
    job.reset();
    setTable(null);
    setRows([]);
    setFilename("");
    setError(undefined);
    setStep("Upload");
  };

  /** Continuing past a picked-out selection is an update by default. */
  const leaveSelectStep = () => {
    if (scope && scope.count > 0 && mode === "create") setMode("update");
    setStep("Upload");
  };

  const close = () => {
    job.stop();
    onClose();
  };

  const downloadErrors = (which: readonly ImportRow[]) => {
    const report = errorReport(fields, mapping, which);
    downloadCsv(`errors-${filename || templateFilename}`, report.headers, report.rows);
  };

  const ready = rows.filter((row) => row.state === "ready");
  const skipped = rows.length - ready.length;
  const creating = ready.filter((row) => row.action === "create").length;
  const updating = ready.length - creating;

  const footer = (): ReactNode => {
    if (step === "Select")
      return (
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button variant="brand" onClick={leaveSelectStep}>
            Continue
          </Button>
        </>
      );

    if (step === "Upload")
      return (
        <>
          <Button variant="outline" onClick={scope ? () => setStep("Select") : close}>
            {scope ? "Back" : "Cancel"}
          </Button>
          <Button
            variant="brand"
            disabled={!table}
            onClick={() => setStep("Map")}
          >
            Continue
          </Button>
        </>
      );

    if (step === "Map")
      return (
        <>
          <Button variant="outline" onClick={() => setStep("Upload")}>
            Back
          </Button>
          <Button
            variant="brand"
            disabled={Boolean(issue) || clashes}
            onClick={validate}
          >
            Continue
          </Button>
        </>
      );

    if (step === "Validate")
      return (
        <>
          <Button variant="outline" onClick={() => setStep("Map")}>
            Back
          </Button>
          <Button
            variant="brand"
            disabled={ready.length === 0}
            onClick={() => setStep("Preview")}
          >
            Continue
          </Button>
        </>
      );

    if (step === "Preview")
      return (
        <>
          <Button variant="outline" onClick={() => setStep("Validate")}>
            Back
          </Button>
          <Button
            variant="brand"
            disabled={ready.length === 0}
            onClick={() => {
              job.start(rows);
              setStep("Done");
            }}
          >
            {ready.length > 0
              ? `Import ${ready.length} ${ready.length === 1 ? noun.one : noun.many}`
              : `Import ${noun.many}`}
          </Button>
        </>
      );

    if (job.state === "running")
      return (
        <Button variant="outline" onClick={job.stop}>
          Stop
        </Button>
      );

    return (
      <>
        {job.summary.failed > 0 && (
          <Button variant="outline" onClick={job.retryFailed}>
            Retry {job.summary.failed} failed{" "}
            {job.summary.failed === 1 ? "row" : "rows"}
          </Button>
        )}
        <Button variant="outline" onClick={startAgain}>
          Upload another file
        </Button>
        <Button variant="brand" onClick={close}>
          Done
        </Button>
      </>
    );
  };

  return (
    <Modal
      isOpen
      onClose={close}
      title={title}
      description={description}
      variant="plain"
      size="lg"
      footer={footer()}
    >
      <div className="space-y-4">
        <BulkImportSteps steps={steps} active={step} />

        {step !== "Upload" && step !== "Select" && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line pb-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas text-muted"
            >
              <FileSpreadsheet className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-heading">
                {filename}
              </p>
              <p className="text-[13px] text-muted">
                {table?.body.length ?? 0}{" "}
                {(table?.body.length ?? 0) === 1 ? "row" : "rows"} ·{" "}
                {mode === "create"
                  ? "adding only"
                  : mode === "update"
                    ? "updating only"
                    : "adding & updating"}
                {scope && scope.count > 0 && ` · ${scope.summary}`}
              </p>
            </div>

            {step !== "Done" && (
              <button
                type="button"
                onClick={startAgain}
                className="rounded px-1 text-[13px] font-semibold text-auth-panel transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-auth-panel/25 focus-visible:outline-none"
              >
                Choose a different file
              </button>
            )}
          </div>
        )}

        {step === "Select" && scope && scope.children}

        {step === "Upload" && (
          <>
            <BulkImportFileStep
              noun={noun}
              fields={fields}
              mode={mode}
              onModeChange={setMode}
              onTemplate={downloadTemplate}
              onFile={(file) => void readFile(file)}
              chosen={
                table && filename
                  ? { name: filename, rows: table.body.length }
                  : undefined
              }
              error={error}
            />
            {requirements}
          </>
        )}

        {step === "Map" && table && (
          <BulkImportMapStep
            fields={fields}
            table={table}
            mapping={mapping}
            issue={issue}
            onChange={(key, column) =>
              setMapping((current) => ({
                ...current,
                [key]: column < 0 ? UNMAPPED : column,
              }))
            }
          />
        )}

        {step === "Validate" && (
          <BulkImportValidateStep
            noun={noun}
            rows={rows}
            columns={previewColumns}
            onDownloadErrors={() => downloadErrors(rows)}
          />
        )}

        {step === "Preview" && (
          <div className="space-y-3">
            <p className="text-[13px] text-muted">
              What this file will do, row by row.{" "}
              {creating > 0 && `${creating} to add`}
              {creating > 0 && updating > 0 && " · "}
              {updating > 0 && `${updating} to update`}
              {skipped > 0 && ` · ${skipped} skipped`}
            </p>

            <DataTable
              columns={previewColumns}
              rows={rows.slice(0, PREVIEW_LIMIT)}
              rowKey={(row) => String(row.line)}
              uppercaseHeaders
              bordered
              dense
            />

            {rows.length > PREVIEW_LIMIT && (
              <p className="text-[11px] text-muted">
                Showing the first {PREVIEW_LIMIT} of {rows.length} rows. All of
                them are checked — the counts above cover the whole file.
              </p>
            )}
          </div>
        )}

        {step === "Done" &&
          (job.state === "running" ? (
            <BulkImportProgress
              noun={noun}
              processed={job.processed}
              total={job.total}
            />
          ) : (
            <BulkImportSummary
              noun={noun}
              summary={job.summary}
              rows={job.rows}
              columns={previewColumns}
              stopped={job.state === "stopped"}
              onDownloadErrors={() => downloadErrors(job.rows)}
            />
          ))}
      </div>
    </Modal>
  );
};
