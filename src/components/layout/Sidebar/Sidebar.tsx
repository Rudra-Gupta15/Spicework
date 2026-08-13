import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { NAVIGATION } from "@/config/navigation";
import { CURRENT_USER } from "@/config/user";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/types/navigation";

import { SidebarFooter } from "./SidebarFooter";
import { SidebarNavItem } from "./SidebarNavItem";

/** True when the item, or any of its children, matches the current path. */
const isItemActive = (item: NavItem, pathname: string): boolean =>
  item.path === pathname ||
  (item.children?.some((child) => child.path === pathname) ?? false);

/** Group that should be open for a given path (none when nothing matches). */
const activeGroupId = (pathname: string): string | null =>
  NAVIGATION.find(
    (item) => item.children?.some((child) => child.path === pathname),
  )?.id ?? null;

interface SidebarProps {
  /** Off-canvas state — only used below the `lg` breakpoint. */
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const logout = useLogout();
  const activeGroup = activeGroupId(pathname);
  const [expandedId, setExpandedId] = useState<string | null>(activeGroup);
  const [syncedPath, setSyncedPath] = useState(pathname);

  /* Keep the group containing the active route open on navigation —
     derived during render instead of in an effect (no extra paint). */
  if (syncedPath !== pathname) {
    setSyncedPath(pathname);
    if (activeGroup && activeGroup !== expandedId) setExpandedId(activeGroup);
  }

  /* Accordion behaviour: opening one group closes the others. */
  const handleToggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return (
    <>
      {/* Mobile scrim */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-30 bg-navy-900/50 transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col bg-sidebar",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid h-9 w-9 place-items-center rounded-lg text-sidebar-muted hover:bg-sidebar-hover hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-slim flex-1 overflow-y-auto px-4 pb-4">
          <ul className="space-y-1">
            {NAVIGATION.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={isItemActive(item, pathname)}
                isExpanded={expandedId === item.id}
                onToggle={handleToggle}
                onNavigate={onClose}
              />
            ))}
          </ul>
        </nav>

        <SidebarFooter user={CURRENT_USER} onLogout={logout} />
      </aside>
    </>
  );
};
