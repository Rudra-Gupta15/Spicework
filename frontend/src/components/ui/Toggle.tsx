import { useId } from "react";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Text rendered next to the switch. */
  label: string;
  /** Hides the label visually but keeps it for screen readers. */
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** On/off switch used for form settings such as auto-renewal. */
export const Toggle = ({
  checked,
  onChange,
  label,
  hideLabel = false,
  disabled = false,
  id,
  className,
}: ToggleProps) => {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const labelId = `${switchId}-label`;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150",
          "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          checked ? "bg-brand" : "bg-navy-200",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-150",
            checked ? "translate-x-[23px]" : "translate-x-[3px]",
          )}
        />
      </button>

      <label
        id={labelId}
        htmlFor={switchId}
        className={cn(
          "cursor-pointer text-sm text-heading select-none",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
    </div>
  );
};
