import { useCallback, useRef, useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";

import { cn } from "@/lib/cn";
import type { AttachedFile } from "@/types/ticket";

const ACCEPTED = [".png", ".jpg", ".jpeg", ".pdf", ".txt", ".log"];
const MAX_BYTES = 10 * 1024 * 1024;

/** `24576` -> `24 KB`. */
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface FileDropzoneProps {
  files: AttachedFile[];
  onChange: (files: AttachedFile[]) => void;
}

/** Dashed drop target that also opens the file picker on click. */
export const FileDropzone = ({ files, onChange }: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setOver] = useState(false);
  const [error, setError] = useState<string>();

  const browse = useCallback(() => inputRef.current?.click(), []);

  const accept = useCallback(
    (picked: FileList | null) => {
      if (!picked?.length) return;

      const added: AttachedFile[] = [];
      const rejected: string[] = [];

      for (const file of picked) {
        const extension = file.name.slice(file.name.lastIndexOf("."));
        const isAllowed = ACCEPTED.includes(extension.toLowerCase());

        if (isAllowed && file.size <= MAX_BYTES) {
          added.push({ name: file.name, size: file.size });
        } else {
          rejected.push(file.name);
        }
      }

      setError(
        rejected.length > 0
          ? `Skipped ${rejected.join(", ")} — check the file type and the 10MB limit.`
          : undefined,
      );

      /* A file picked twice stays in the list once. */
      const kept = added.filter(
        (file) => !files.some((existing) => existing.name === file.name),
      );

      if (kept.length > 0) onChange([...files, ...kept]);
    },
    [files, onChange],
  );

  const isEmpty = files.length === 0;

  return (
    <div>
      <div
        role={isEmpty ? "button" : undefined}
        tabIndex={isEmpty ? 0 : undefined}
        onClick={isEmpty ? browse : undefined}
        onKeyDown={
          isEmpty
            ? (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                browse();
              }
            : undefined
        }
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          accept(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-lg border border-dashed transition-colors",
          "focus-visible:ring-2 focus-visible:ring-auth-panel/20 focus-visible:outline-none",
          isEmpty && "grid cursor-pointer place-items-center px-6 py-8 text-center",
          !isEmpty && "p-3",
          isOver
            ? "border-brand bg-brand-50"
            : cn("border-field bg-canvas", isEmpty && "hover:border-navy-300"),
        )}
      >
        {isEmpty ? (
          <>
            <UploadCloud
              className="h-6 w-6 text-muted"
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <p className="mt-2 text-sm font-semibold text-heading">
              Drag and drop files here, or click to browse
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Supports PNG, JPG, PDF, TXT, LOG up to 10MB
            </p>
          </>
        ) : (
          <>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.name} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-muted"
                  >
                    <FileText className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-heading">
                      {file.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatSize(file.size)}
                    </span>
                  </span>

                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      onChange(files.filter((item) => item.name !== file.name))
                    }
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-status-offline focus-visible:ring-2 focus-visible:ring-navy-300/50 focus-visible:outline-none"
                  >
                    <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={browse}
              className="mt-2 rounded px-1 text-[13px] font-semibold text-auth-panel transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-auth-panel/25 focus-visible:outline-none"
            >
              Add another file
            </button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="sr-only"
          aria-label="Attach files"
          onChange={(event) => {
            accept(event.target.files);
            /* Reset so picking the same file again still fires a change. */
            event.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-2 text-xs text-status-offline">{error}</p>}
    </div>
  );
};
