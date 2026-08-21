import { useCallback, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { cn } from "@/lib/cn";
import type { CommandSnippet } from "@/types/agent";

interface TerminalBlockProps {
  snippet: CommandSnippet;
  className?: string;
}

/**
 * `navigator.clipboard` only exists in a secure context — HTTPS, or
 * `localhost` specifically. A deploy still on plain HTTP loses the API
 * outright rather than having it fail, which is why this can work in local
 * dev and do nothing in production. `execCommand("copy")` is deprecated but
 * still broadly supported and has no such restriction, so it is the fallback
 * rather than the fix — the actual fix is TLS on the deployment.
 */
const copyViaExecCommand = (text: string): boolean => {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();

  let ok: boolean;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(area);
  return ok;
};

/** Dark terminal window with a title bar, traffic lights and a copy button. */
export const TerminalBlock = ({ snippet, className }: TerminalBlockProps) => {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = useCallback(async () => {
    let ok: boolean;

    try {
      await navigator.clipboard.writeText(snippet.command);
      ok = true;
    } catch {
      ok = copyViaExecCommand(snippet.command);
    }

    /* A visible failure rather than the button silently doing nothing —
       the person still needs to get this command somehow, e.g. by
       selecting it by hand. */
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 1500);
  }, [snippet.command]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-navy-800 bg-navy-900",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-navy-800 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-status-offline" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-maintenance" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-online" />
          </span>
          <span className="text-xs font-medium text-navy-300">
            {snippet.title}
          </span>
        </div>

        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
            "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
            state === "copied" && "bg-signal-500/15 text-signal-500",
            state === "failed" && "bg-status-offline/15 text-status-offline",
            state === "idle" &&
              "bg-navy-700 text-navy-200 hover:bg-navy-600 hover:text-white",
          )}
        >
          {state === "copied" && (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
              Copied
            </>
          )}
          {state === "failed" && (
            <>
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              Select text to copy
            </>
          )}
          {state === "idle" && (
            <>
              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
              1-Click Copy
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-relaxed">
        <code className="font-mono break-all whitespace-pre-wrap text-signal-500">
          {snippet.command}
        </code>
      </pre>
    </div>
  );
};
