import { Clock, MoreHorizontal, Trash2 } from "lucide-react";

import { Button, Modal } from "@/components/ui";
import { savedAtLabel } from "@/data/savedSearches";
import { useDisclosure } from "@/hooks/useDisclosure";
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
 * separate lines nobody can tell apart, the list keeps one row and moves the
 * repeats here, where the time each was saved is what distinguishes them.
 *
 * A dialog rather than a dropdown: the table scrolls sideways, and any panel
 * anchored inside it is clipped by that scroll container and squeezed behind
 * its own scrollbar.
 */
export const SavedSearchHistoryMenu = ({
  saves,
  onView,
  onDelete,
}: SavedSearchHistoryMenuProps) => {
  const { isOpen, open, close } = useDisclosure();

  /* Nothing to reveal when the name was only ever saved once. */
  if (saves.length < 2) return null;

  const act = (run: () => void) => {
    close();
    run();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`${saves.length} saves under this name`}
        title={`${saves.length} saves under this name`}
        className="flex h-8 items-center gap-1 rounded-md border border-line bg-surface px-2 text-[13px] font-semibold text-heading transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-300/50"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2.2} />
        {saves.length}
      </button>

      {isOpen && (
        <Modal
          isOpen
          onClose={close}
          title={saves[0].name}
          description={`Saved ${saves.length} times. Open any one of them, or remove the ones you no longer need.`}
          variant="plain"
          size="md"
          footer={
            <Button variant="outline" onClick={close}>
              Close
            </Button>
          }
        >
          <ul className="divide-y divide-line">
            {saves.map((save, index) => (
              <li key={save.id} className="flex items-center gap-3 py-3">
                <Clock className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.9} />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-heading">
                    {savedAtLabel(save)}
                    {index === 0 && (
                      <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[12px] font-medium text-brand-600">
                        latest
                      </span>
                    )}
                  </p>
                  <p className="text-[13px] text-muted">
                    {save.created} · {save.results} results
                  </p>
                </div>

                <Button variant="outline" size="sm" onClick={() => act(() => onView(save))}>
                  View
                </Button>
                <button
                  type="button"
                  aria-label={`Delete the save from ${savedAtLabel(save)}`}
                  onClick={() => act(() => onDelete(save))}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-status-offline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-offline/40"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
};
