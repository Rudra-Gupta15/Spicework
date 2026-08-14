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
  | "ghost";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-auth-panel text-white hover:bg-navy-700 focus-visible:ring-auth-panel/40",
  brand: "bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand/40",
  success:
    "bg-signal-500 text-white hover:bg-signal-600 focus-visible:ring-signal-500/40",
  danger:
    "bg-status-offline text-white hover:bg-status-offline-600 focus-visible:ring-status-offline/40",
  outline:
    "border border-line bg-surface text-heading hover:bg-canvas focus-visible:ring-navy-300/50",
  ghost: "text-heading hover:bg-canvas focus-visible:ring-navy-300/50",
};

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
      "disabled:cursor-not-allowed disabled:opacity-60",
      VARIANTS[variant],
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
