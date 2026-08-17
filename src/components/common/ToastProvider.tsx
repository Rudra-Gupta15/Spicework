import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  ToastContext,
  type ShowToast,
  type ToastMessage,
  type ToastTone,
} from "@/hooks/useToast";

/** Long enough to read two lines, short enough not to sit in the way. */
const AUTO_DISMISS_MS = 4500;

/** Beyond this the oldest drops off rather than filling the screen. */
const MAX_VISIBLE = 3;

const TONES: Record<ToastTone, { icon: typeof Info; badge: string }> = {
  success: { icon: CheckCircle2, badge: "bg-green-50 text-status-online" },
  danger: { icon: AlertTriangle, badge: "bg-red-50 text-status-offline" },
  info: { icon: Info, badge: "bg-blue-50 text-status-info" },
};

interface ToastCardProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const ToastCard = ({ toast, onDismiss }: ToastCardProps) => {
  const { icon: Icon, badge } = TONES[toast.tone];

  /* Each card owns its own timer, so a second toast arriving does not reset
     the countdown on the first. */
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto flex w-[340px] max-w-[calc(100vw-2rem)] animate-[fadeInDown_180ms_ease-out] items-start gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-2xl"
    >
      <span
        aria-hidden="true"
        className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", badge)}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-heading">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[13px] break-words text-muted">
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-heading focus-visible:ring-2 focus-visible:ring-navy-300/50 focus-visible:outline-none"
      >
        <X className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
};

/**
 * Holds the toast stack for the whole app, top-right, newest below the ones
 * already up so an arrival never shifts what somebody is mid-way through
 * reading. Mounted above the router on purpose: "Filter saved" is raised a
 * moment before the Saved Search screen replaces the one that raised it, and
 * a toast owned by the outgoing page would unmount with it.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastId = useRef(0);

  const dismiss = useCallback(
    (id: number) => setToasts((current) => current.filter((t) => t.id !== id)),
    [],
  );

  const show = useCallback<ShowToast>((toast) => {
    lastId.current += 1;
    const next = { ...toast, id: lastId.current };

    setToasts((current) => [...current.slice(1 - MAX_VISIBLE), next]);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}

      {toasts.length > 0 &&
        createPortal(
          <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col items-end gap-2.5">
            {toasts.map((toast) => (
              <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
};
