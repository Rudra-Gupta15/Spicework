import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { NAVIGATION } from "@/config/navigation";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/types/navigation";

import { SidebarFooter } from "./SidebarFooter";
import { SidebarNavItem } from "./SidebarNavItem";

/** Matches the route and anything nested under it (detail pages, tabs…). */
const matches = (path: string | undefined, pathname: string): boolean =>
  path !== undefined &&
  (pathname === path || pathname.startsWith(`${path}/`));

/** True when the item, or any of its children, matches the current path. */
const isItemActive = (item: NavItem, pathname: string): boolean =>
  matches(item.path, pathname) ||
  (item.children?.some((child) => matches(child.path, pathname)) ?? false);

/** Group that should be open for a given path (none when nothing matches). */
const activeGroupId = (pathname: string): string | null =>
  NAVIGATION.find(
    (item) => item.children?.some((child) => matches(child.path, pathname)),
  )?.id ?? null;

interface SidebarProps {
  /** Off-canvas state — only used below the `lg` breakpoint. */
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const company = useCurrentCompany();
  const logout = useLogout();
  const activeGroup = activeGroupId(pathname);
  const [expandedId, setExpandedId] = useState<string | null>(activeGroup);
  const [syncedPath, setSyncedPath] = useState(pathname);

  /* The expanded group always follows the route: the group owning the active
     page opens, and landing anywhere outside every group — Dashboard, Reports,
     a link from inside the page — collapses whatever was open, so Inventory
     can't stay hanging open over an unrelated screen. Derived during render
     instead of in an effect (no extra paint). */
  if (syncedPath !== pathname) {
    setSyncedPath(pathname);
    if (activeGroup !== expandedId) setExpandedId(activeGroup);
  }

  /* Accordion behaviour: opening one group closes the others. */
  const handleToggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  /* A child link keeps its own group open; a top-level link (groupId `null`)
     closes it — clicking Dashboard while Inventory is open collapses it even
     when that page is already the one on screen. */
  const handleNavigate = useCallback(
    (groupId: string | null) => {
      setExpandedId(groupId);
      onClose();
    },
    [onClose],
  );

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
                onNavigate={handleNavigate}
              />
            ))}
          </ul>
        </nav>

        <SidebarFooter company={company} onLogout={logout} />
      </aside>
    </>
  );
};
