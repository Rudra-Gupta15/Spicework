import { useRef } from "react";
import { Braces, Bookmark, ChevronDown, FileSpreadsheet } from "lucide-react";

import { Button, MenuItem, MenuPanel, MenuSeparator } from "@/components/ui";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import type { ExportFormat } from "@/lib/exportRows";

interface SaveFilterMenuProps {
  /** Persists the current selection as a saved search. */
  onSaveFilter?: () => void;
  onExport?: (format: ExportFormat) => void;
  isSaving?: boolean;
  /** How many rows the filter currently matches — quoted on the export items
      so nobody exports 600 rows expecting the six on screen. */
  rowCount: number;
}

/**
 * The filter bar's one composite action, shared by every inventory screen:
 * keep this filter, or take its results away with you. Saving and exporting
 * belong together because both answer "I have narrowed this down — now what",
 * and splitting them would put three brand buttons in a row.
 */
export const SaveFilterMenu = ({
  onSaveFilter,
  onExport,
  isSaving = false,
  rowCount,
}: SaveFilterMenuProps) => {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, close, isOpen);

  const rows = `${rowCount.toLocaleString()} ${rowCount === 1 ? "row" : "rows"}`;

  const run = (action?: () => void) => {
    close();
    action?.();
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="brand"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        isLoading={isSaving}
        onClick={toggle}
      >
        Save Filter
        {!isSaving && (
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={2.2}
          />
        )}
      </Button>

      {isOpen && (
        <MenuPanel className="w-64">
          <MenuItem
            icon={<Bookmark className="h-4 w-4" strokeWidth={2} />}
            onClick={() => run(onSaveFilter)}
          >
            <span className="block font-semibold">Save as new filter</span>
            <span className="block text-[11px] font-normal text-muted">
              Keeps it under Saved Search
            </span>
          </MenuItem>

          <MenuSeparator />

          <MenuItem
            icon={<FileSpreadsheet className="h-4 w-4" strokeWidth={2} />}
            onClick={() => run(() => onExport?.("csv"))}
          >
            <span className="block font-semibold">Export as CSV</span>
            <span className="block text-[11px] font-normal text-muted">
              {rows} · opens in Excel
            </span>
          </MenuItem>

          <MenuItem
            icon={<Braces className="h-4 w-4" strokeWidth={2} />}
            onClick={() => run(() => onExport?.("json"))}
          >
            <span className="block font-semibold">Export as JSON</span>
            <span className="block text-[11px] font-normal text-muted">
              {rows} · raw field values
            </span>
          </MenuItem>
        </MenuPanel>
      )}
    </div>
  );
};
