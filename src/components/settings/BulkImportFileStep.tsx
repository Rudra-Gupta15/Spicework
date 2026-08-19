import { useRef, useState } from "react";
import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui";
import { ACCEPTED_IMPORT_FILES, MAX_IMPORT_FILE_MB } from "@/lib/bulkImport";
import { cn } from "@/lib/cn";
import type { ImportField, ImportMode } from "@/types/bulkImport";

/** The three things a file is allowed to do, and what each one means. */
const importTypes = (noun: { one: string; many: string }): {
  mode: ImportMode;
  label: string;
  hint: string;
}[] => [
  {
    mode: "create",
    label: `Create ${noun.many}`,
    hint: "Rows already on record are skipped",
  },
  {
    mode: "update",
    label: `Update ${noun.many}`,
    hint: "Nothing new is created — matching rows are changed",
  },
  {
    mode: "upsert",
    label: "Create & update",
    hint: "New rows are added, matching ones updated",
  },
];

interface BulkImportFileStepProps {
  noun: { one: string; many: string };
  fields: readonly ImportField[];
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  onTemplate: () => void;
  onFile: (file: File | undefined) => void;
  /** The file already read, waiting on Continue. */
  chosen?: { name: string; rows: number };
  error?: string;
}

/**
 * Step one: what the file is allowed to do, which columns it can carry, and
 * the file itself. The template is offered beside the drop zone on purpose —
 * a file built from it needs no mapping at all.
 */
export const BulkImportFileStep = ({
  noun,
  fields,
  mode,
  onModeChange,
  onTemplate,
  onFile,
  chosen,
  error,
}: BulkImportFileStepProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setOver] = useState(false);

  const browse = () => inputRef.current?.click();

  /* Fields keep their declared order inside each group, and the groups keep
     the order they first appear in — Identity before Warranty, always. */
  const groups = fields.reduce((map, field) => {
    map.set(field.group, [...(map.get(field.group) ?? []), field]);
    return map;
  }, new Map<string, ImportField[]>());

  const identifier = fields.find((field) => field.identifier);

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold text-heading">
          Import type
        </legend>

        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {importTypes(noun).map((option) => (
            <button
              key={option.mode}
              type="button"
              aria-pressed={mode === option.mode}
              onClick={() => onModeChange(option.mode)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left transition-colors",
                "focus-visible:ring-2 focus-visible:ring-auth-panel/25 focus-visible:outline-none",
                mode === option.mode
                  ? "border-brand bg-brand-50"
                  : "border-line bg-canvas hover:border-navy-300",
              )}
            >
              <span className="block text-[13px] font-semibold text-heading">
                {option.label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                {option.hint}
              </span>
            </button>
          ))}
        </div>

        {identifier && (
          <p className="mt-2 text-[13px] text-muted">
            Rows are matched to a {noun.one.toLowerCase()} on{" "}
            <span className="font-semibold text-heading">
              {identifier.label}
            </span>
            . On an update, a column the file leaves out is left as it is.
          </p>
        )}
      </fieldset>

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
          onFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "grid cursor-pointer place-items-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
          "focus-visible:ring-2 focus-visible:ring-auth-panel/20 focus-visible:outline-none",
          isOver
            ? "border-brand bg-brand-50"
            : chosen
              ? "border-status-online/40 bg-green-50"
              : "border-field bg-canvas hover:border-navy-300",
        )}
      >
        {chosen ? (
          <>
            <FileSpreadsheet
              className="h-6 w-6 text-status-online"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <p className="mt-2 max-w-full truncate text-sm font-semibold text-heading">
              {chosen.name}
            </p>
            <p className="mt-1 text-[13px] text-muted">
              {chosen.rows} {chosen.rows === 1 ? "row" : "rows"} read · click to
              choose a different file
            </p>
          </>
        ) : (
          <>
            <UploadCloud
              className="h-6 w-6 text-muted"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-heading">
              Drag &amp; drop your file
            </p>
            <p className="mt-1 text-[13px] text-muted">or</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(event) => {
                event.stopPropagation();
                browse();
              }}
            >
              Browse Files
            </Button>

            <p className="mt-2.5 text-[11px] text-muted">
              CSV / XLSX · Max {MAX_IMPORT_FILE_MB} MB
            </p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-status-offline">{error}</p>}

      <div className="rounded-lg border border-line bg-canvas px-4 py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading">
              Columns this upload accepts
            </p>
            <p className="mt-1 text-[13px] text-muted">
              A header row is optional; with one, the columns can be in any
              order and anything matched wrongly is corrected on the next step.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" strokeWidth={2.1} />}
            onClick={onTemplate}
          >
            Download Template
          </Button>
        </div>

        <dl className="mt-3 space-y-2 text-[13px]">
          {[...groups.entries()].map(([group, groupFields]) => (
            <div key={group} className="flex gap-2">
              <dt className="w-28 shrink-0 font-semibold text-heading">
                {group}
              </dt>
              <dd className="min-w-0 text-muted">
                {groupFields.map((field, index) => (
                  <span key={field.key}>
                    {index > 0 && " · "}
                    <span
                      className={cn(
                        field.required && "font-semibold text-heading",
                      )}
                    >
                      {field.label}
                    </span>
                    {field.required && "*"}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-2.5 text-[11px] text-muted">
          * needed to create a {noun.one.toLowerCase()}. Dates read as
          dd/mm/yyyy or yyyy-mm-dd; prices as plain figures.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMPORT_FILES.join(",")}
        className="sr-only"
        aria-label="Choose a CSV or XLSX file"
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          /* Reset so picking the same file again still fires a change. */
          event.target.value = "";
        }}
      />
    </div>
  );
};
