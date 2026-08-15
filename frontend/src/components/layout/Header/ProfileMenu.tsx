import { useRef } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import { Avatar, MenuItem, MenuPanel, MenuSeparator } from "@/components/ui";
import type { CurrentUser } from "@/config/user";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { cn } from "@/lib/cn";

const MENU_LINKS = [
  { id: "profile", label: "My Profile", icon: UserRound, path: "/settings" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
] as const;

interface ProfileMenuProps {
  user: CurrentUser;
  onLogout: () => void;
}

/** Avatar button in the header with a dropdown of account actions. */
export const ProfileMenu = ({ user, onLogout }: ProfileMenuProps) => {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, close, isOpen);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-auth-panel/30 focus-visible:outline-none",
          isOpen ? "bg-canvas" : "hover:bg-canvas",
        )}
      >
        <Avatar name={user.name} />

        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-semibold text-heading">
            {user.name}
          </span>
          <span className="block text-xs leading-tight text-muted">
            {user.role}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition-transform duration-200",
            isOpen && "-rotate-180",
          )}
          strokeWidth={2.2}
        />
      </button>

      {isOpen && (
        <MenuPanel className="w-56">
          <div className="border-b border-line px-3 pt-1.5 pb-2.5 sm:hidden">
            <p className="text-sm font-semibold text-heading">{user.name}</p>
            <p className="text-xs text-muted">{user.role}</p>
          </div>

          {MENU_LINKS.map(({ id, label, icon: Icon, path }) => (
            <MenuItem
              key={id}
              to={path}
              onClick={close}
              icon={<Icon className="h-4 w-4" strokeWidth={1.9} />}
            >
              {label}
            </MenuItem>
          ))}

          <MenuSeparator />

          <MenuItem
            tone="danger"
            icon={<LogOut className="h-4 w-4" strokeWidth={1.9} />}
            onClick={() => {
              close();
              onLogout();
            }}
          >
            Log out
          </MenuItem>
        </MenuPanel>
      )}
    </div>
  );
};
