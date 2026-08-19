import { useRef } from "react";
import { Clock, MoreHorizontal, Trash2 } from "lucide-react";

import { MenuItem, MenuPanel } from "@/components/ui";
import { savedAtLabel } from "@/data/savedSearches";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import type { SavedSearch } from "@/types/savedSearch";

interface SavedSearchHistoryMenuProps {
  /** Every save under this name, newest first. */
  saves: SavedSearch[];
  onView: (search: SavedSearch) => void;
  onDelete: (search: SavedSearch) => void;
}

/**
 * The earlier saves sitting behind one row.
 *
 * Saving the same view twice in a day produces rows that are identical on
 * screen — same auto-generated name, same date. Rather than show them as
 * separate lines nobody can tell apart, the list keeps one row and hides the
 * repeats here, where the time each was saved is what distinguishes them.
 */
export const SavedSearchHistoryMenu = ({
  saves,
  onView,
  onDelete,
}: SavedSearchHistoryMenuProps) => {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, close, isOpen);

  /* Nothing to reveal when the name was only ever saved once. */
  if (saves.length < 2) return null;

  const act = (run: () => void) => {
    close();
    run();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`${saves.length} saves under this name`}
        title={`${saves.length} saves under this name`}
        className="flex h-8 items-center gap-1 rounded-md border border-line bg-surface px-2 text-[13px] font-semibold text-heading transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-300/50"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2.2} />
        {saves.length}
      </button>

      {isOpen && (
        <MenuPanel align="right" className="w-64">
          <p className="px-3 pt-2 pb-1 text-[12px] font-semibold tracking-wide text-muted uppercase">
            Saved {saves.length} times
          </p>
          {saves.map((save, index) => (
            <MenuItem
              key={save.id}
              icon={<Clock className="h-4 w-4" strokeWidth={1.9} />}
              onClick={() => act(() => onView(save))}
              trailing={
                <button
                  type="button"
                  aria-label={`Delete the save from ${savedAtLabel(save)}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    act(() => onDelete(save));
                  }}
                  className="rounded p-1 text-muted transition-colors hover:bg-red-50 hover:text-status-offline"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
              }
            >
              <span className="flex flex-col">
                <span>
                  {savedAtLabel(save)}
                  {index === 0 && (
                    <span className="ml-1.5 text-[12px] text-muted">latest</span>
                  )}
                </span>
                <span className="text-[12px] text-muted">
                  {save.created} · {save.results} results
                </span>
              </span>
            </MenuItem>
          ))}
        </MenuPanel>
      )}
    </div>
  );
};
