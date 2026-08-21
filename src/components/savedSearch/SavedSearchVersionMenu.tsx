import { Check, Clock, History } from "lucide-react";

import { Button, Modal } from "@/components/ui";
import { savedAtLabel } from "@/data/savedSearches";
import { useDisclosure } from "@/hooks/useDisclosure";
import type { SavedSearch } from "@/types/savedSearch";

interface SavedSearchVersionMenuProps {
  /** Every save under this name, newest first — including the open one. */
  saves: SavedSearch[];
  /** Which of them is on screen, so it can be marked and not re-opened. */
  currentId: string;
  onSelect: (search: SavedSearch) => void;
}

/**
 * Switches between the saves made under one name.
 *
 * An unfiltered save is auto-named "All <category> — <today>", so saving the
 * same view five times in a day leaves five searches with identical titles.
 * From the list they are at least separate rows; from in here the heading is
 * the same for all of them, and without this there is no way to tell which one
 * is open or to reach the others without going back.
 *
 * A dialog rather than a dropdown: the saves are distinguished only by time,
 * so each line needs room for its date, its time and its result count.
 */
export const SavedSearchVersionMenu = ({
  saves,
  currentId,
  onSelect,
}: SavedSearchVersionMenuProps) => {
  const { isOpen, open, close } = useDisclosure();

  /* Nothing to switch between when the name was only ever saved once. */
  if (saves.length < 2) return null;

  const position = saves.findIndex((save) => save.id === currentId) + 1;

  return (
    <>
      <Button
        variant="outline"
        leftIcon={<History className="h-4 w-4" strokeWidth={2.2} />}
        onClick={open}
        aria-haspopup="dialog"
        title={`${saves.length} saves under this name`}
      >
        {/* "2 of 5" rather than a bare count: which one is open matters as
            much as how many there are, and the heading cannot say it. */}
        {position > 0 ? `Save ${position} of ${saves.length}` : `${saves.length} saves`}
      </Button>

      {isOpen && (
        <Modal
          isOpen
          onClose={close}
          title={saves[0].name}
          description={`Saved ${saves.length} times under this name. Open any one of them to see what it returned.`}
          variant="plain"
          size="md"
          footer={
            <Button variant="outline" onClick={close}>
              Close
            </Button>
          }
        >
          <ul className="max-h-[420px] divide-y divide-line overflow-y-auto">
            {saves.map((save, index) => {
              const isCurrent = save.id === currentId;

              return (
                <li key={save.id} className="flex items-center gap-3 py-3">
                  {isCurrent ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-brand"
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  ) : (
                    <Clock
                      className="h-4 w-4 shrink-0 text-muted"
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-heading">
                      {save.created} · {savedAtLabel(save)}
                      {index === 0 && (
                        <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[12px] font-medium text-brand-600">
                          latest
                        </span>
                      )}
                    </p>
                    <p className="text-[13px] text-muted">
                      {save.results} results when saved · {save.filters}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isCurrent}
                    onClick={() => {
                      close();
                      onSelect(save);
                    }}
                  >
                    {isCurrent ? "Open" : "View"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </>
  );
};
