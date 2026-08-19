import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useDisclosure } from "@/hooks/useDisclosure";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { cn } from "@/lib/cn";

import { CONTROL_SIZES, type ControlSize } from "./controlSize";
import { MenuItem, MenuPanel } from "./Menu";

interface SelectProps {
  options: readonly string[];
  /** Shared control height — matches Button and Input at the same size. */
  size?: ControlSize;
  value: string;
  onChange: (value: string) => void;
  /** Muted prefix rendered before the value, e.g. "Type:". */
  label?: string;
  /** Icon rendered before the value (e.g. a calendar). */
  leading?: ReactNode;
  /** `bare` drops the border — used in card headers. */
  variant?: "bordered" | "bare";
  /** Which edge the panel is anchored to. */
  align?: "left" | "right";
  /** Stretches the trigger and panel to the column width — form layouts. */
  fullWidth?: boolean;
  /** Shown in place of the value while nothing is selected. */
  placeholder?: string;
  /** Validation state — matches the red border `Input` uses. */
  error?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

/**
 * Value picker with the app's own dropdown panel (see `Menu.tsx`) instead of
 * the browser's native menu, so it matches the profile dropdown.
 */
export const Select = ({
  options,
  value,
  onChange,
  size = "sm",
  label,
  leading,
  variant = "bordered",
  align = "left",
  fullWidth = false,
  placeholder,
  error = false,
  id,
  className,
  ...props
}: SelectProps) => {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useOnClickOutside(containerRef, close, isOpen);

  const selectedIndex = Math.max(options.indexOf(value), 0);

  /* Move focus into the list when it opens. */
  useEffect(() => {
    if (isOpen) itemsRef.current[selectedIndex]?.focus();
  }, [isOpen, selectedIndex]);

  const handleSelect = useCallback(
    (option: string) => {
      onChange(option);
      close();
      triggerRef.current?.focus();
    },
    [onChange, close],
  );

  /** Arrow keys roam the list; Esc closes and returns focus to the trigger. */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const focusAt = (index: number) => {
        event.preventDefault();
        const wrapped = (index + options.length) % options.length;
        itemsRef.current[wrapped]?.focus();
      };

      const current = itemsRef.current.findIndex(
        (item) => item === document.activeElement,
      );

      if (event.key === "ArrowDown") focusAt(current + 1);
      else if (event.key === "ArrowUp") focusAt(current - 1);
      else if (event.key === "Home") focusAt(0);
      else if (event.key === "End") focusAt(options.length - 1);
      else if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    },
    [options.length, close],
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative", fullWidth ? "block w-full" : "inline-block")}
    >
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={error ? true : undefined}
        aria-label={props["aria-label"]}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-lg transition-colors",
          "focus-visible:ring-2 focus-visible:ring-auth-panel/25 focus-visible:outline-none",
          CONTROL_SIZES[size],
          variant === "bordered" &&
            (error
              ? "border border-status-offline bg-surface px-2.5"
              : "border border-field bg-surface px-2.5 hover:border-navy-300"),
          variant === "bare" && "px-2 hover:bg-canvas",
          isOpen && variant === "bordered" && !error && "border-auth-panel",
          fullWidth && "w-full justify-between px-3.5",
          className,
        )}
      >
        {leading}

        {label && <span className="whitespace-nowrap text-muted">{label}</span>}

        <span
          className={cn(
            "truncate",
            fullWidth
              ? "flex-1 text-left font-normal"
              : "max-w-[140px] font-semibold",
            value ? "text-heading" : "text-navy-300",
          )}
        >
          {value || placeholder}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:text-heading",
            isOpen && "-rotate-180",
          )}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <MenuPanel
          role="listbox"
          align={align}
          className={cn(
            "min-w-full",
            fullWidth ? "w-full" : "w-max max-w-[260px]",
          )}
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => (
            <MenuItem
              key={option}
              role="option"
              ref={(node) => {
                itemsRef.current[index] = node;
              }}
              selected={option === value}
              onClick={() => handleSelect(option)}
              trailing={
                option === value ? (
                  <Check className="h-4 w-4 text-brand" strokeWidth={2.4} />
                ) : null
              }
            >
              {option}
            </MenuItem>
          ))}
        </MenuPanel>
      )}
    </div>
  );
};
