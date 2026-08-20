import { Menu } from "lucide-react";

import { APP_NAME } from "@/config/app";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useLogout } from "@/hooks/useLogout";

import { ProfileMenu } from "./ProfileMenu";

interface HeaderProps {
  onMenuClick: () => void;
}

/** Sticky top bar of the authenticated app — holds the profile menu. */
export const Header = ({ onMenuClick }: HeaderProps) => {
  const company = useCurrentCompany();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-heading transition-colors hover:bg-canvas lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      {/* The left of the bar was empty. The welcome is the one thing that
          belongs there — the page's own title is rendered by `Navbar` inside
          the content area, so repeating it here would only say the same thing
          twice. The account is named on the right, so the welcome names the
          product instead of repeating it. Held back on a phone, where the row
          has just enough room for the menu button and the account. */}
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm leading-tight font-semibold text-heading">
          Welcome to {APP_NAME}
        </p>
      </div>

      <div className="ml-auto">
        <ProfileMenu company={company} onLogout={logout} />
      </div>
    </header>
  );
};
