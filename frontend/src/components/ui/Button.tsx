import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

import { CONTROL_SIZES, type ControlSize } from "./controlSize";

type ButtonVariant =
  | "primary"
  | "brand"
  | "success"
  | "danger"
  | "outline"
  | "outlinePrimary"
  | "ghost";

/**
 * The app has one call-to-action colour — brand orange. `primary` and
 * `brand` are the same fill on purpose, so no flow can drift to its own
 * CTA colour; `success` and `danger` stay reserved for outcome-specific
 * actions (a confirmed scan, a destructive confirm).
 */
const CTA = "bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand/40";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: CTA,
  brand: CTA,
  success:
    "bg-signal-500 text-white hover:bg-signal-600 focus-visible:ring-signal-500/40",
  danger:
    "bg-status-offline text-white hover:bg-status-offline-600 focus-visible:ring-status-offline/40",
  outline:
    "border border-line bg-surface text-heading hover:bg-canvas focus-visible:ring-navy-300/50",
  outlinePrimary:
    "border border-auth-panel bg-surface text-auth-panel hover:bg-navy-50 focus-visible:ring-auth-panel/30",
  ghost: "text-heading hover:bg-canvas focus-visible:ring-navy-300/50",
};

/** Variants drawn as an outline rather than a filled block. */
const OUTLINED: ButtonVariant[] = ["outline", "outlinePrimary", "ghost"];

/**
 * One disabled look for the whole app: a filled button greys out to a flat
 * chip, an outlined one keeps its shape in grey. The `disabled:` variants
 * outrank the base colours, so no variant can leak its own hover through.
 */
const DISABLED_FILLED =
  "disabled:bg-navy-50 disabled:text-navy-300 disabled:hover:bg-navy-50";

const DISABLED_OUTLINED =
  "disabled:border-line disabled:bg-surface disabled:text-navy-300 disabled:hover:bg-surface";

/** A button that is busy stays in its own colour — it is not "off". */
const LOADING = "disabled:cursor-wait disabled:opacity-80";

/** Horizontal padding per size; the height/type come from CONTROL_SIZES. */
const PADDING: Record<ControlSize, string> = {
  sm: "px-3.5",
  md: "px-4",
  lg: "px-5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ControlSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  leftIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled ?? isLoading}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150",
      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:shadow-none",
      VARIANTS[variant],
      isLoading
        ? LOADING
        : OUTLINED.includes(variant)
          ? DISABLED_OUTLINED
          : DISABLED_FILLED,
      CONTROL_SIZES[size],
      PADDING[size],
      fullWidth && "w-full",
      className,
    )}
    {...props}
  >
    {isLoading ? (
      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
    ) : (
      leftIcon
    )}
    {children}
  </button>
);
