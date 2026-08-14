import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------
 * The dropdown look used across the app — profile menu, filter selects and
 * anything else that opens a floating panel.
 * ---------------------------------------------------------------------- */

interface MenuPanelProps {
  /** Which edge the panel is anchored to. */
  align?: "left" | "right";
  className?: string;
  children: ReactNode;
  /** `listbox` for a value picker, `menu` for a list of actions. */
  role?: "menu" | "listbox";
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

/** Breathing room kept between the panel and the edge of the screen. */
const VIEWPORT_MARGIN = 8;

export const MenuPanel = ({
  align = "right",
  className,
  children,
  role = "menu",
  onKeyDown,
}: MenuPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * A panel anchored to a trigger near the edge of a phone screen would
   * otherwise hang off it and scroll the whole page sideways. The panel
   * only mounts while it is open, so measuring once here is enough: nudge
   * it back inside the viewport before the browser paints.
   */
  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    node.style.transform = "";
    const { left, right } = node.getBoundingClientRect();

    let shift = 0;
    if (right > window.innerWidth - VIEWPORT_MARGIN)
      shift = window.innerWidth - VIEWPORT_MARGIN - right;
    if (left + shift < VIEWPORT_MARGIN) shift = VIEWPORT_MARGIN - left;

    node.style.transform = shift ? `translateX(${Math.round(shift)}px)` : "";
  }, []);

  return (
    <div
      ref={panelRef}
      role={role}
      onKeyDown={onKeyDown}
      className={cn(
        "absolute z-30 mt-2 max-w-[calc(100vw-1rem)] rounded-xl border border-line bg-surface p-1.5 shadow-lg",
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface MenuItemProps {
  /** Renders a router <Link> instead of a button. */
  to?: string;
  onClick?: () => void;
  icon?: ReactNode;
  /** Trailing slot — e.g. a check mark on the selected option. */
  trailing?: ReactNode;
  tone?: "default" | "danger";
  /** Highlights the item as the current value. */
  selected?: boolean;
  role?: "menuitem" | "option";
  className?: string;
  children: ReactNode;
}

const baseItemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none";

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  (
    {
      to,
      onClick,
      icon,
      trailing,
      tone = "default",
      selected = false,
      role = "menuitem",
      className,
      children,
    },
    ref,
  ) => {
    const classes = cn(
      baseItemClass,
      tone === "danger" ? "text-status-offline" : "text-heading",
      selected ? "bg-canvas font-semibold" : "hover:bg-canvas focus-visible:bg-canvas",
      className,
    );

    const content = (
      <>
        {icon && <span className="shrink-0 text-muted">{icon}</span>}
        <span className="flex-1 truncate">{children}</span>
        {trailing}
      </>
    );

    if (to) {
      return (
        <Link to={to} role={role} onClick={onClick} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        role={role}
        aria-selected={role === "option" ? selected : undefined}
        onClick={onClick}
        className={classes}
      >
        {content}
      </button>
    );
  },
);

MenuItem.displayName = "MenuItem";

/** Thin rule between groups of items. */
export const MenuSeparator = () => (
  <div className="my-1.5 h-px bg-line" aria-hidden="true" />
);
