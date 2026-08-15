import { useRef } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";

import { Button, MenuItem, MenuPanel } from "@/components/ui";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import type { ReportFormat } from "@/types/report";

const FORMATS: {
  format: ReportFormat;
  label: string;
  hint: string;
  icon: typeof FileText;
}[] = [
  {
    format: "pdf",
    label: "Download PDF",
    hint: "Print-ready document",
    icon: FileText,
  },
  {
    format: "excel",
    label: "Download Excel",
    hint: "One sheet per section",
    icon: FileSpreadsheet,
  },
];

interface ReportDownloadMenuProps {
  onDownload: (format: ReportFormat) => void;
  disabled?: boolean;
}

/** The report's two export options, behind the app's dropdown panel. */
export const ReportDownloadMenu = ({
  onDownload,
  disabled = false,
}: ReportDownloadMenuProps) => {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, close, isOpen);

  const pick = (format: ReportFormat) => {
    close();
    onDownload(format);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="brand"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        leftIcon={<Download className="h-4 w-4" strokeWidth={2.2} />}
        onClick={toggle}
      >
        Download Report
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.2}
        />
      </Button>

      {isOpen && (
        <MenuPanel className="w-60">
          {FORMATS.map(({ format, label, hint, icon: Icon }) => (
            <MenuItem
              key={format}
              icon={<Icon className="h-4 w-4" strokeWidth={2} />}
              onClick={() => pick(format)}
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
