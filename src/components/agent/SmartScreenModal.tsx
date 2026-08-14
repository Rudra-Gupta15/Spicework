import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

/** Windows SmartScreen uses the system UI font, not the app's Inter. */
const SYSTEM_FONT =
  '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';

interface SmartScreenModalProps {
  /** Name of the launcher being "run". */
  filename: string;
  /** Fired by "Run anyway" — lets the agent start. */
  onRun: () => void;
  /** Fired by "Don't run", Escape or the scrim. */
  onDismiss: () => void;
}

/**
 * A replica of the Microsoft Defender SmartScreen prompt an unsigned launcher
 * triggers on Windows. Not a real OS dialog — a prototype stand-in so the
 * download-and-run flow reads end to end.
 */
export const SmartScreenModal = ({
  filename,
  onRun,
  onDismiss,
}: SmartScreenModalProps) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onDismiss]);

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/50"
        onClick={onDismiss}
        aria-hidden="true"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Windows protected your PC"
        style={{ fontFamily: SYSTEM_FONT }}
        className="relative flex max-h-[88dvh] w-full max-w-[680px] flex-col overflow-y-auto bg-[#1366c8] p-6 text-white shadow-2xl sm:p-10"
      >
        <h2 className="text-[22px] leading-tight font-normal sm:text-[30px]">
          Windows protected your PC
        </h2>

        <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-white/90">
          Microsoft Defender SmartScreen prevented an unrecognized app from
          starting. Running this app might put your PC at risk.
        </p>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 flex w-fit items-center gap-2 text-[15px] underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          <Info className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          More info
        </button>

        {expanded && (
          <dl className="mt-5 space-y-1 text-[15px] text-white/90">
            <div className="flex gap-2">
              <dt className="text-white/70">App:</dt>
              <dd className="break-all">{filename}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-white/70">Publisher:</dt>
              <dd>Unknown publisher</dd>
            </div>
          </dl>
        )}

        {/* Buttons pin to the bottom-right, as in the real dialog. */}
        <div className="mt-auto flex flex-wrap justify-end gap-2 pt-8 sm:pt-10">
          {expanded && (
            <button
              type="button"
              onClick={onRun}
              className="h-9 min-w-[110px] border border-white/70 bg-transparent px-4 text-[14px] text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              Run anyway
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            autoFocus
            className="h-9 min-w-[110px] bg-white px-4 text-[14px] font-normal text-[#1a1a1a] transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Don't run
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
