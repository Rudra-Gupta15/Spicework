import { useRef } from "react";
import { ChevronDown, HardDrive, UploadCloud, Users } from "lucide-react";

import { Button, MenuItem, MenuPanel } from "@/components/ui";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

/** What a bulk upload is bringing in. */
export type BulkUploadKind = "users" | "assets";

const OPTIONS: {
  kind: BulkUploadKind;
  label: string;
  hint: string;
  icon: typeof Users;
}[] = [
  {
    kind: "users",
    label: "Upload Users",
    hint: "Invite several people at once",
    icon: Users,
  },
  {
    kind: "assets",
    label: "Upload Assets",
    hint: "Add kit, or update owners and warranties",
    icon: HardDrive,
  },
];

interface BulkUploadMenuProps {
  onPick: (kind: BulkUploadKind) => void;
}

/** The header's "Bulk Upload" button and the two things it can bring in. */
export const BulkUploadMenu = ({ onPick }: BulkUploadMenuProps) => {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, close, isOpen);

  const pick = (kind: BulkUploadKind) => {
    close();
    onPick(kind);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        leftIcon={<UploadCloud className="h-4 w-4" strokeWidth={2.1} />}
        onClick={toggle}
      >
        Bulk Upload
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.2}
        />
      </Button>

      {isOpen && (
        <MenuPanel className="w-64">
          {OPTIONS.map(({ kind, label, hint, icon: Icon }) => (
            <MenuItem
              key={kind}
              icon={<Icon className="h-4 w-4" strokeWidth={2} />}
              onClick={() => pick(kind)}
            >
              <span className="block font-semibold">{label}</span>
              <span className="block text-[11px] font-normal text-muted">
                {hint}
              </span>
            </MenuItem>
          ))}
        </MenuPanel>
      )}
    </div>
  );
};
