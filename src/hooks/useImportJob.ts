import { useCallback, useEffect, useRef, useState } from "react";

import { summarize } from "@/lib/bulkImport";
import type { ImportRow, ImportSummary } from "@/types/bulkImport";

/**
 * Where a run stands. `stopped` is a run the user cut short — whatever it
 * had already written stays written, which is why it reports a summary of
 * its own rather than being treated as if it never happened.
 */
export type ImportJobState = "idle" | "running" | "done" | "stopped";

/**
 * How many rows are committed before the loop gives the browser its thread
 * back, and how long it waits before picking up again. Small enough that a
 * cancel lands almost immediately and the progress bar actually moves.
 */
const CHUNK = 4;
const PAUSE = 90;

export interface ImportJob {
  state: ImportJobState;
  /** Counts up on every run, so a caller can tell a retry from a repaint. */
  run: number;
  /** Every row of the file, updated in place as the run reaches it. */
  rows: ImportRow[];
  /** Rows attempted so far, out of the ones the run set out to write. */
  processed: number;
  total: number;
  summary: ImportSummary;
  start: (rows: ImportRow[]) => void;
  /** Attempts the rows the write refused, leaving the invalid ones alone. */
  retryFailed: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Runs a checked file into the estate a few rows at a time instead of in one
 * blocking pass. A thousand-row import is a job, not a click: it reports
 * where it has got to, can be stopped part way, and records what each row
 * did — so a failure halfway through is a row to retry rather than an import
 * that has to be started over.
 *
 * `commit` writes one row and returns a message to fail just that row; the
 * rest of the file carries on regardless.
 */
export const useImportJob = (
  commit: (row: ImportRow) => string | undefined,
): ImportJob => {
  const [state, setState] = useState<ImportJobState>("idle");
  const [run, setRun] = useState(0);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);

  /* The loop reads these rather than state, so a chunk scheduled before a
     stop or an unmount can still see that it should not run. */
  const timer = useRef<number>(undefined);
  const cancelled = useRef(false);
  const commitRef = useRef(commit);

  commitRef.current = commit;

  const clearTimer = () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  useEffect(() => {
    return () => {
      cancelled.current = true;
      clearTimer();
    };
  }, []);

  /** Walks the queue in chunks, writing each row and recording what it did. */
  const walk = useCallback((queue: ImportRow[], allRows: ImportRow[]) => {
    const worked = allRows.map((row) => ({ ...row }));
    const byLine = new Map(worked.map((row) => [row.line, row]));

    cancelled.current = false;
    setRun((count) => count + 1);
    setRows(worked);
    setTotal(queue.length);
    setProcessed(0);
    setState(queue.length === 0 ? "done" : "running");

    let index = 0;

    const step = () => {
      if (cancelled.current) return;

      const until = Math.min(index + CHUNK, queue.length);

      for (; index < until; index += 1) {
        const row = byLine.get(queue[index].line);
        if (!row) continue;

        const failure = commitRef.current(row);
        row.state = failure ? "failed" : "imported";
        row.error = failure;
      }

      /* A fresh array every chunk — the rows are mutated in place above, and
         the table only repaints if the reference it was handed changes. */
      setRows(worked.map((row) => ({ ...row })));
      setProcessed(index);

      if (index >= queue.length) {
        setState("done");
        return;
      }

      timer.current = window.setTimeout(step, PAUSE);
    };

    timer.current = window.setTimeout(step, PAUSE);
  }, []);

  const start = useCallback(
    (next: ImportRow[]) => {
      clearTimer();
      walk(
        next.filter((row) => row.state === "ready"),
        next,
      );
    },
    [walk],
  );

  const retryFailed = useCallback(() => {
    clearTimer();

    /* Only the writes that were refused are worth another attempt — a row
       the checks turned down fails the same way every time until the file
       itself is fixed. */
    const again = rows.map((row) =>
      row.state === "failed"
        ? { ...row, state: "ready" as const, error: undefined }
        : row,
    );

    walk(
      again.filter((row) => row.state === "ready"),
      again,
    );
  }, [rows, walk]);

  /** Only a run in flight can be stopped — closing an idle dialog is not one. */
  const stop = useCallback(() => {
    cancelled.current = true;
    clearTimer();
    setState((current) => (current === "running" ? "stopped" : current));
  }, []);

  const reset = useCallback(() => {
    cancelled.current = true;
    clearTimer();
    setState("idle");
    setRows([]);
    setProcessed(0);
    setTotal(0);
  }, []);

  return {
    state,
    run,
    rows,
    processed,
    total,
    summary: summarize(rows),
    start,
    retryFailed,
    stop,
    reset,
  };
};
