import { useId } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** `row` tints the whole row when checked — used in pickers. */
  variant?: "plain" | "row";
  className?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  variant = "plain",
  className,
}: CheckboxProps) => {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 text-sm transition-colors select-none",
        variant === "row" && "rounded-md px-3 py-2.5",
        variant === "row" &&
          (checked
            ? "bg-brand-50 font-medium text-heading"
            : "text-muted hover:bg-canvas"),
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={cn(
          "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-focus-visible:ring-offset-1",
          checked
            ? "border-brand bg-brand text-white"
            : "border-field bg-surface",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3.4} />}
      </span>

      <span className="truncate">{label}</span>
    </label>
  );
};
