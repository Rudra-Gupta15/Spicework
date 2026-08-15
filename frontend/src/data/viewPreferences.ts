import { useEffect, useState } from "react";

import { api } from "@/lib/api";

/** App-wide (not per-user — see backend/routers/view_preferences.py) saved
    column selection for a table view, e.g. "hardware" or "software". */
const fetchViewColumns = (viewName: string) =>
  api.get<{ view_name: string; columns: string[] | null }>(`/api/view-preferences/${viewName}`);

export const saveViewColumns = (viewName: string, columns: string[]) =>
  api.post<{ status: string }>(`/api/view-preferences/${viewName}`, { columns });

/**
 * Loads the saved column selection for a view, falling back to
 * `defaultColumns` until (or unless) the server has one on file. Also
 * returns a `save` function that persists a new selection.
 */
export const useViewColumns = <Key extends string>(
  viewName: string,
  defaultColumns: Key[],
) => {
  const [columns, setColumns] = useState<Key[]>(defaultColumns);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchViewColumns(viewName)
      .then((data) => {
        if (!cancelled && data.columns && data.columns.length > 0) {
          setColumns(data.columns as Key[]);
        }
      })
      .catch(() => {
        /* Fall back to the defaults already in state — not worth surfacing
           an error banner for a non-critical preference load. */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewName]);

  const save = (next: Key[]) => {
    setColumns(next);
    void saveViewColumns(viewName, next);
  };

  return { columns, isLoading, save };
};
