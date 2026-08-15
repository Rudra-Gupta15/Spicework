import { memo } from "react";
import { LogOut } from "lucide-react";

import type { CurrentUser } from "@/config/user";

interface SidebarFooterProps {
  user: CurrentUser;
  onLogout?: () => void;
}

/** Signed-in user block pinned to the bottom of the sidebar. */
const SidebarFooterComponent = ({ user, onLogout }: SidebarFooterProps) => (
  <div className="border-t border-sidebar-border px-4 py-4">
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-navy-300">{user.role}</p>
      </div>

      <button
        type="button"
        onClick={onLogout}
        aria-label="Log out"
        title="Log out"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-700 text-sidebar-muted transition-colors duration-150 hover:bg-navy-600 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:outline-none"
      >
        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </button>
    </div>
  </div>
);

export const SidebarFooter = memo(SidebarFooterComponent);
