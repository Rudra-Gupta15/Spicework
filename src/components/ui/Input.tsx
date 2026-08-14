import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { CONTROL_SIZES, type ControlSize } from "./controlSize";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Shared control height — matches Button and Select at the same size. */
  size?: ControlSize;
  label?: string;
  /** Validation message rendered under the field. */
  error?: string;
  /** Rendered inside the field on the right (e.g. a password toggle). */
  trailing?: ReactNode;
  /** Rendered inside the field on the left (e.g. a search icon). */
  leading?: ReactNode;
  /** Classes for the wrapper — use to control the field's width. */
  containerClassName?: string;
}

/** Labelled text field used across forms. */
export const Input = ({
  size = "lg",
  label,
  error,
  trailing,
  leading,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            {leading}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-lg border bg-surface px-3.5 text-heading",
            CONTROL_SIZES[size],
            "placeholder:text-navy-300 transition-colors duration-150",
            /* The field keeps its resting border when focused — no ring and
               no colour change. `outline-none` still has to be here, or the
               browser draws its own ring in place of the one dropped. */
            "focus:outline-none",
            error ? "border-status-offline" : "border-field",
            trailing && "pr-11",
            leading && "pl-10",
            className,
          )}
          {...props}
        />

        {trailing && (
          <span className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </span>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-status-offline">
          {error}
        </p>
      )}
    </div>
  );
};
