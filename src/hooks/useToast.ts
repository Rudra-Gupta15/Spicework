import { createContext, useContext } from "react";

/** Colour and icon of a toast — what happened, not how loud it is. */
export type ToastTone = "success" | "danger" | "info";

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  /** One line, sentence case, says what happened. */
  title: string;
  /** Optional second line — a filename, a count, an error detail. */
  description?: string;
}

export type ShowToast = (toast: Omit<ToastMessage, "id">) => void;

export const ToastContext = createContext<ShowToast | null>(null);

/**
 * Fires a toast from anywhere under `<ToastProvider>`, which wraps the whole
 * app — including the router, so a toast raised just before a navigation is
 * still on screen when the next page paints.
 */
export const useToast = (): ShowToast => {
  const show = useContext(ToastContext);

  if (!show)
    throw new Error("useToast must be used inside <ToastProvider>.");

  return show;
};
