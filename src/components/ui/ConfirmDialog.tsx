import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/cn";

import { Button } from "./Button";

type ConfirmTone = "danger" | "brand";

const TONES: Record<ConfirmTone, { icon: string; confirm: "danger" | "brand" }> =
  {
    danger: { icon: "bg-status-offline-50 text-status-offline", confirm: "danger" },
    brand: { icon: "bg-brand-50 text-brand", confirm: "brand" },
  };

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  /** Sentence explaining what confirming will do. */
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Colour of the icon badge and the confirm button. */
  tone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Centred yes/no prompt for destructive actions — no title bar, so it reads
 * as an alert rather than a full dialog. Escape and the scrim both cancel.
 */
export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Esc cancels; body scroll is locked while open. */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const palette = TONES[tone];

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/60"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby="confirm-dialog-description"
        tabIndex={-1}
        className="scrollbar-slim-light relative max-h-[calc(100dvh-2rem)] w-full max-w-105 overflow-y-auto rounded-xl bg-surface px-6 py-7 text-center shadow-2xl outline-none sm:px-8 sm:py-8"
      >
        <span
          aria-hidden="true"
          className={cn(
            "mx-auto grid h-14 w-14 place-items-center rounded-full",
            palette.icon,
          )}
        >
          <AlertTriangle className="h-6 w-6" strokeWidth={2} />
        </span>

        <h2 className="mt-5 text-xl font-bold text-heading">{title}</h2>

        <p
          id="confirm-dialog-description"
          className="mt-2 text-sm text-muted"
        >
          {description}
        </p>

        <div className="mt-6 space-y-3">
          <Button variant="outline" size="lg" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={palette.confirm}
            size="lg"
            fullWidth
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
