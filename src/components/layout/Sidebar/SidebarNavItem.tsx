import { memo, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import type { NavItem } from "@/types/navigation";

/** Shared row styling for every top-level entry (link or group toggle). */
const rowClass =
  "flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70";

interface SidebarNavItemProps {
  item: NavItem;
  /** The group is expanded (only relevant when the item has children). */
  isExpanded: boolean;
  /** The item itself, or one of its children, matches the current route. */
  isActive: boolean;
  onToggle: (id: string) => void;
  /**
   * Called with the group the clicked link belongs to, or `null` for a
   * top-level link that sits outside every group — that's what tells the
   * sidebar whether the open group should survive the navigation.
   */
  onNavigate: (groupId: string | null) => void;
}

const SidebarNavItemComponent = ({
  item,
  isExpanded,
  isActive,
  onToggle,
  onNavigate,
}: SidebarNavItemProps) => {
  const { icon: Icon, label, path, children } = item;
  const handleToggle = useCallback(() => onToggle(item.id), [onToggle, item.id]);
  const handleChildNavigate = useCallback(
    () => onNavigate(item.id),
    [onNavigate, item.id],
  );
  const handleLinkNavigate = useCallback(() => onNavigate(null), [onNavigate]);

  const iconClass = "h-[18px] w-[18px] shrink-0";

  /* Group entry — expands/collapses its children. */
  if (children?.length) {
    return (
      <li>
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls={`nav-group-${item.id}`}
          className={cn(
            rowClass,
            isActive
              ? "bg-brand text-white hover:bg-brand-600"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white",
          )}
        >
          <Icon className={iconClass} strokeWidth={1.9} />
          <span className="flex-1 text-left">{label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isExpanded && "-rotate-180",
            )}
            strokeWidth={2.2}
          />
        </button>

        {/* Height-animated so expanding/collapsing stays smooth. */}
        <div
          id={`nav-group-${item.id}`}
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <ul className="overflow-hidden">
            {children.map((child) => (
              <li key={child.id}>
                <NavLink
                  to={child.path}
                  onClick={handleChildNavigate}
                  tabIndex={isExpanded ? undefined : -1}
                  className={({ isActive: childActive }) =>
                    cn(
                      "block rounded-lg py-2.5 pr-3 pl-12 text-[15px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70",
                      childActive
                        ? "font-semibold text-white"
                        : "text-sidebar-muted hover:text-white",
                    )
                  }
                >
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  }

  /* Plain link entry. */
  return (
    <li>
      <NavLink
        to={path ?? "#"}
        onClick={handleLinkNavigate}
        className={({ isActive: linkActive }) =>
          cn(
            rowClass,
            linkActive
              ? "bg-brand text-white hover:bg-brand-600"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white",
          )
        }
      >
        <Icon className={iconClass} strokeWidth={1.9} />
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export const SidebarNavItem = memo(SidebarNavItemComponent);
