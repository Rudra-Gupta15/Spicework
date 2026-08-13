import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

type ModalSize = "sm" | "md" | "lg";

const SIZES: Record<ModalSize, string> = {
  sm: "max-w-[420px]",
  md: "max-w-[560px]",
  lg: "max-w-[720px]",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Sub-header line under the title bar. */
  description?: string;
  /** Right-aligned action row pinned to the bottom. */
  footer?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
}

/**
 * Centred dialog rendered in a portal, with the app's navy title bar.
 * Closes on the X, the scrim and Escape.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  footer,
  size = "sm",
  children,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Esc closes; body scroll is locked while open. */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full overflow-hidden rounded-lg bg-surface shadow-2xl outline-none",
          SIZES[size],
        )}
      >
        <header className="flex items-center justify-between gap-3 bg-auth-panel px-5 py-3.5">
          <h2 className="text-[17px] font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/85 transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>

        {description && (
          <p className="border-b border-line px-5 py-3 text-[13px] text-muted">
            {description}
          </p>
        )}

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-line bg-canvas px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
