import { PanelLeft } from "lucide-react";

import { CURRENT_USER } from "@/config/user";
import { useLogout } from "@/hooks/useLogout";

import { ProfileMenu } from "./ProfileMenu";

interface HeaderProps {
  onMenuClick: () => void;
}

/** Sticky top bar of the authenticated app — holds the profile menu. */
export const Header = ({ onMenuClick }: HeaderProps) => {
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-heading transition-colors hover:bg-canvas lg:hidden"
      >
        <PanelLeft className="h-5 w-5" strokeWidth={1.9} />
      </button>

      <div className="ml-auto">
        <ProfileMenu user={CURRENT_USER} onLogout={logout} />
      </div>
    </header>
  );
};
