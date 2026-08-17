import { useRef, useState } from "react";
import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";

import {
  Badge,
  Button,
  DataTable,
  Modal,
  type Column,
} from "@/components/ui";
import {
  ADMIN_ROLE_OPTIONS,
  USER_IMPORT_COLUMNS,
  parseUserImport,
  siteOptions,
  userImportTemplate,
  type UserImportRow,
} from "@/data/admin";
import { downloadCsv, parseCsv } from "@/lib/csv";
import { cn } from "@/lib/cn";

interface BulkUploadUsersModalProps {
  onClose: () => void;
  /** Handed the checked rows — the caller commits the ones that passed. */
  onImport: (rows: UserImportRow[]) => void;
}

const TEMPLATE_FILENAME = "spiceworks-users-template.csv";

/** What the picker accepts; anything else is refused before it is read. */
const ACCEPTED = [".csv", ".txt"];

const COLUMNS: Column<UserImportRow>[] = [
  {
    key: "line",
    header: "Row",
    className: "w-14",
    cellClassName: "text-muted tabular-nums",
  },
  {
    key: "user",
    header: "User",
    render: (row) => (
      <div className="min-w-0">
        <p className="font-semibold text-heading">{row.name || "—"}</p>
        <p className="text-[13px] text-muted">{row.email || "—"}</p>
      </div>
    ),
  },
  { key: "role", header: "Role", cellClassName: "text-muted" },
  { key: "siteName", header: "Site", cellClassName: "text-muted" },
  {
    key: "status",
    header: "Status",
    wrap: true,
    render: (row) =>
      row.error ? (
        <div className="min-w-0">
          <Badge tone="danger">Skipped</Badge>
          <p className="mt-1 text-[13px] text-muted">{row.error}</p>
        </div>
      ) : (
        <Badge tone="success">Ready</Badge>
      ),
  },
];

/**
 * "Bulk Upload" on the Team Members screen. Reads a CSV, checks every row
 * against the rules the invite dialog enforces, and shows the verdict before
 * anything is written — an import that would half-succeed is not a surprise
 * anybody should get after the fact.
 */
export const BulkUploadUsersModal = ({
  onClose,
  onImport,
}: BulkUploadUsersModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState("");
  const [rows, setRows] = useState<UserImportRow[] | null>(null);
  const [isOver, setOver] = useState(false);
  const [error, setError] = useState<string>();

  const browse = () => inputRef.current?.click();

  const downloadTemplate = () =>
    downloadCsv(TEMPLATE_FILENAME, [...USER_IMPORT_COLUMNS], userImportTemplate());

  const read = async (file: File | undefined) => {
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED.includes(extension)) {
      setError("That is not a CSV file — export the sheet as .csv and try again.");
      return;
    }

    const text = await file.text();
    const parsed = parseUserImport(text);

    if (parsed.length === 0) {
      setError(
        parseCsv(text).length === 0
          ? "That file is empty."
          : "No rows found under the header — check the file has data.",
      );
      return;
    }

    setError(undefined);
    setFilename(file.name);
    setRows(parsed);
  };

  const ready = rows?.filter((row) => !row.error) ?? [];
  const skipped = (rows?.length ?? 0) - ready.length;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Bulk Upload Users"
      description="Upload a CSV to invite several people at once. Everyone lands as Invited, exactly as they would from the invite dialog."
      variant="plain"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="brand"
            disabled={ready.length === 0}
            onClick={() => rows && onImport(rows)}
          >
            {ready.length > 0
              ? `Import ${ready.length} ${ready.length === 1 ? "User" : "Users"}`
              : "Import Users"}
          </Button>
        </>
      }
    >
      {rows === null ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-canvas px-4 py-3.5">
            <p className="text-sm font-semibold text-heading">
              Columns the file needs
            </p>
            <p className="mt-1 text-[13px] text-muted">
              {USER_IMPORT_COLUMNS.join(", ")} — one person per row. A header
              row is optional; with one, the columns can be in any order.
            </p>

            <dl className="mt-3 space-y-1.5 text-[13px]">
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold text-heading">Role</dt>
                <dd className="min-w-0 text-muted">
                  {ADMIN_ROLE_OPTIONS.join(" · ")}. Leave it blank for
                  Technician.
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold text-heading">Site</dt>
                <dd className="min-w-0 text-muted">
                  Must match one of your sites: {siteOptions().join(" · ")}.
                </dd>
              </div>
            </dl>

            <Button
              variant="outline"
              size="sm"
              className="mt-3.5"
              leftIcon={<Download className="h-4 w-4" strokeWidth={2.1} />}
              onClick={downloadTemplate}
            >
              Download CSV Template
            </Button>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={browse}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              browse();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setOver(false);
              void read(event.dataTransfer.files[0]);
            }}
            className={cn(
              "grid cursor-pointer place-items-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
              "focus-visible:ring-2 focus-visible:ring-auth-panel/20 focus-visible:outline-none",
              isOver
                ? "border-brand bg-brand-50"
                : "border-field bg-canvas hover:border-navy-300",
            )}
          >
            <UploadCloud
              className="h-6 w-6 text-muted"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-heading">
              Drag a CSV here, or click to browse
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Nothing is saved until you review the rows and confirm
            </p>
          </div>

          {error && <p className="text-xs text-status-offline">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
                {rows.length} {rows.length === 1 ? "row" : "rows"} ·{" "}
                {ready.length} ready
                {skipped > 0 && ` · ${skipped} skipped`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRows(null);
                setFilename("");
              }}
              className="rounded px-1 text-[13px] font-semibold text-auth-panel transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-auth-panel/25 focus-visible:outline-none"
            >
              Choose a different file
            </button>
          </div>

          {skipped > 0 && (
            <p className="rounded-lg border border-status-maintenance/30 bg-amber-50 px-4 py-3 text-[13px] text-heading">
              {skipped} {skipped === 1 ? "row" : "rows"} will be left out.
              Importing brings in the {ready.length} that passed — fix the rest
              and upload them again.
            </p>
          )}

          <DataTable
            columns={COLUMNS}
            rows={rows}
            rowKey={(row) => String(row.line)}
            uppercaseHeaders
            bordered
            dense
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        aria-label="Choose a CSV file"
        onChange={(event) => {
          void read(event.target.files?.[0]);
          /* Reset so picking the same file again still fires a change. */
          event.target.value = "";
        }}
      />
    </Modal>
  );
};
