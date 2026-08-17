import { useRef } from "react";
import { Building2, ChevronDown, LogOut, Settings } from "lucide-react";

import { Avatar, MenuItem, MenuPanel, MenuSeparator } from "@/components/ui";
import type { CurrentCompany } from "@/config/company";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { cn } from "@/lib/cn";

/* The login is the organization's, so the account actions open the
   organization — there is no personal profile behind this menu. */
const MENU_LINKS = [
  {
    id: "organization",
    label: "Organization Profile",
    icon: Building2,
    path: "/dashboard/organization",
  },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
] as const;

interface ProfileMenuProps {
  company: CurrentCompany;
  onLogout: () => void;
}

/** Account button in the header — identifies the signed-in company, with a
    dropdown of the actions that account can take. */
export const ProfileMenu = ({ company, onLogout }: ProfileMenuProps) => {
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
        aria-label={`${company.name} account menu`}
        className={cn(
          "flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-auth-panel/30 focus-visible:outline-none",
          isOpen ? "bg-canvas" : "hover:bg-canvas",
        )}
      >
        <Avatar name={company.name} />

        <span className="hidden text-left sm:block">
          <span className="block max-w-[180px] truncate text-sm leading-tight font-semibold text-heading">
            {company.name}
          </span>
          <span className="block text-xs leading-tight text-muted">
            {company.accountType}
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
        <MenuPanel className="w-64">
          {/* Who is signed in, spelled out — the button only has room for
              the name, and on small screens not even that. */}
          <div className="border-b border-line px-3 pt-1.5 pb-2.5">
            <p className="truncate text-sm font-semibold text-heading">
              {company.name}
            </p>
            <p className="truncate text-xs text-muted">{company.email}</p>
            <p className="mt-1.5 text-xs text-muted">
              {company.accountType} · {company.industry}
            </p>
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
