import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowDownToLine, FileText } from "lucide-react";

import { cn } from "@/lib/cn";

interface DownloadToastProps {
  filename: string;
  /** Size line, e.g. "4.5 KB". */
  size: string;
  /** Present for a Windows launcher — clicking the chip "runs" it. */
  onRun?: () => void;
  onClose: () => void;
}

/** Browser-style download chip that drops in at the top-right of the screen. */
export const DownloadToast = ({
  filename,
  size,
  onRun,
  onClose,
}: DownloadToastProps) => {
  /* Auto-dismiss, the way a real download shelf fades out. */
  useEffect(() => {
    const timer = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(timer);
  }, [filename, onClose]);

  return createPortal(
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex justify-end px-2">
      <div
        role={onRun ? "button" : undefined}
        tabIndex={onRun ? 0 : undefined}
        onClick={onRun}
        onKeyDown={
          onRun
            ? (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onRun();
              }
            : undefined
        }
        title={onRun ? "Run downloaded file" : undefined}
        className={cn(
          "animate-[fadeInDown_180ms_ease-out] pointer-events-auto flex w-[360px] max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-2xl",
          onRun &&
            "cursor-pointer transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
        )}
      >
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-status-info text-white"
        >
          <FileText className="h-5 w-5" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-heading">
            {filename}
          </p>
          <p className="text-xs text-muted">
            {size} • <span className="font-medium text-status-online">Done</span>
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="Dismiss download"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-heading focus-visible:ring-2 focus-visible:ring-navy-300/50 focus-visible:outline-none"
        >
          <ArrowDownToLine className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      </div>
    </div>,
    document.body,
  );
};
