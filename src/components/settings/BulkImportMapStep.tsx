import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

import { Select } from "@/components/ui";
import { UNMAPPED, duplicateMappings } from "@/lib/bulkImport";
import { cn } from "@/lib/cn";
import type { ImportField, ImportMapping, ImportTable } from "@/types/bulkImport";

/** What a field reads when nothing in the file feeds it. */
const NOT_IN_FILE = "— Not in file —";

interface BulkImportMapStepProps {
  fields: readonly ImportField[];
  table: ImportTable;
  mapping: ImportMapping;
  onChange: (fieldKey: string, column: number) => void;
  /** Why the mapping cannot be used yet, if it cannot. */
  issue?: string;
}

/**
 * Step two: which column of the file feeds which field. Worked out
 * automatically from the header and shown rather than assumed — a file
 * exported from somebody else's system calls things by its own names, and
 * the fix for that is a dropdown, not a rewritten spreadsheet.
 */
export const BulkImportMapStep = ({
  fields,
  table,
  mapping,
  onChange,
  issue,
}: BulkImportMapStepProps) => {
  /* Two columns can carry the same label, so the picker distinguishes them
     by position — otherwise picking one of them is a coin toss. */
  const labels = useMemo(() => {
    const counts = new Map<string, number>();
    table.headers.forEach((header) =>
      counts.set(header, (counts.get(header) ?? 0) + 1),
    );

    return table.headers.map((header, index) =>
      (counts.get(header) ?? 0) > 1 ? `${header} · col ${index + 1}` : header,
    );
  }, [table.headers]);

  const options = useMemo(() => [NOT_IN_FILE, ...labels], [labels]);

  const clashes = new Set(duplicateMappings(mapping));

  /** The first value under a column, so a mapping can be checked at a glance. */
  const sampleFor = (column: number): string => {
    if (column === UNMAPPED) return "";

    const row = table.body.find((cells) => (cells[column] ?? "").trim() !== "");
    const value = (row?.[column] ?? "").trim();

    return value.length > 32 ? `${value.slice(0, 32)}…` : value;
  };

  const groups = fields.reduce((map, field) => {
    map.set(field.group, [...(map.get(field.group) ?? []), field]);
    return map;
  }, new Map<string, ImportField[]>());

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted">
        {table.hasHeader
          ? "Matched from the header row. Change anything that landed in the wrong place."
          : "This file has no header row, so its columns were taken in template order. Check each one."}
      </p>

      {issue && (
        <p className="flex items-start gap-2 rounded-lg border border-status-maintenance/30 bg-amber-50 px-4 py-3 text-[13px] text-heading">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-status-maintenance"
            strokeWidth={2}
            aria-hidden="true"
          />
          {issue}
        </p>
      )}

      <div className="space-y-4">
        {[...groups.entries()].map(([group, groupFields]) => (
          <section key={group}>
            <h3 className="text-[11px] font-bold tracking-wide text-muted uppercase">
              {group}
            </h3>

            <div className="mt-2 space-y-2">
              {groupFields.map((field) => {
                const column = mapping[field.key] ?? UNMAPPED;
                const sample = sampleFor(column);

                return (
                  <div
                    key={field.key}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-line px-3 py-2"
                  >
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="truncate text-[13px] font-semibold text-heading">
                        {field.label}
                        {field.required && (
                          <span
                            className="text-status-offline"
                            title="Needed to create a record"
                          >
                            {" "}
                            *
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {sample
                          ? `First value: ${sample}`
                          : (field.hint ?? "Not in this file")}
                      </p>
                    </div>

                    <Select
                      size="sm"
                      options={options}
                      value={
                        column === UNMAPPED
                          ? NOT_IN_FILE
                          : (options[column + 1] ?? NOT_IN_FILE)
                      }
                      onChange={(value) =>
                        onChange(field.key, options.indexOf(value) - 1)
                      }
                      align="right"
                      aria-label={`Column for ${field.label}`}
                      className={cn(
                        "w-52",
                        clashes.has(column) && "border-status-offline",
                      )}
                      error={clashes.has(column)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {clashes.size > 0 && (
        <p className="text-xs text-status-offline">
          One column is feeding more than one field — the same values would be
          written twice.
        </p>
      )}
    </div>
  );
};
