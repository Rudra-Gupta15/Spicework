import { useState } from "react";
import { X } from "lucide-react";

import { Button, Field, Input, Modal, Select } from "@/components/ui";
import {
  DEFAULT_SEARCH_DRAFT,
  SAVED_SEARCH_SCOPES,
} from "@/data/savedSearches";
import type {
  SavedSearchCategory,
  SavedSearchScope,
} from "@/types/savedSearch";

export interface NewSearchDraft {
  
  name: string;
  scope: SavedSearchScope;
  filters: string[];
}

interface CreateSearchModalProps {
  isOpen: boolean;
  /** The active tab — seeds the draft and names the target list. */
  category: SavedSearchCategory;
  onClose: () => void;
  onSave: (draft: NewSearchDraft) => void;
}

/**
 * "Save New Search" dialog. Mount it keyed on the category so switching tabs
 * re-seeds the applied filters and suggested name.
 */
export const CreateSearchModal = ({
  isOpen,
  category,
  onClose,
  onSave,
}: CreateSearchModalProps) => {
  const seed = DEFAULT_SEARCH_DRAFT[category];

  const [name, setName] = useState(seed.name);
  const [scope, setScope] = useState<SavedSearchScope>("Public");
  const [filters, setFilters] = useState<string[]>(seed.filters);
  const [error, setError] = useState<string>();

  const handleSave = () => {
    if (!name.trim()) {
      setError("Name this search so you can find it later.");
      return;
    }
    onSave({ name: name.trim(), scope, filters });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save New Search"
      variant="plain"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={handleSave}>
            Save Search
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Search Name" htmlFor="search-name">
          <Input
            id="search-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(undefined);
            }}
            placeholder="e.g. Online Laptops - Dell & HP"
            error={error}
          />
        </Field>

        <Field label="Scope" htmlFor="search-scope">
          <Select
            id="search-scope"
            size="lg"
            fullWidth
            options={SAVED_SEARCH_SCOPES}
            value={scope}
            onChange={(value) => setScope(value as SavedSearchScope)}
            aria-label="Scope"
          />
        </Field>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-heading">
            Applied Filters
          </p>

          {filters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1 text-[13px] font-medium text-brand-600"
                >
                  {filter}
                  <button
                    type="button"
                    aria-label={`Remove ${filter}`}
                    onClick={() =>
                      setFilters((current) =>
                        current.filter((item) => item !== filter),
                      )
                    }
                    className="grid h-4 w-4 place-items-center rounded-full text-brand-600/70 transition-colors hover:bg-brand-100 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
                  >
                    <X className="h-3 w-3" strokeWidth={2.4} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted">
              No filters applied — this search will return every {category}{" "}
              record.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
