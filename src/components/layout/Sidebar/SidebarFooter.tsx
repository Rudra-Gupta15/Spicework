import { memo } from "react";
import { LogOut } from "lucide-react";

import type { CurrentCompany } from "@/config/company";

interface SidebarFooterProps {
  company: CurrentCompany;
  onLogout?: () => void;
}

/** Signed-in company block pinned to the bottom of the sidebar. */
const SidebarFooterComponent = ({ company, onLogout }: SidebarFooterProps) => (
  <div className="border-t border-sidebar-border px-4 py-4">
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {company.name}
        </p>
        <p className="truncate text-xs text-navy-300">{company.accountType}</p>
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
