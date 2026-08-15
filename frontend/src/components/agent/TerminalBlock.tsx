import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/cn";
import type { CommandSnippet } from "@/types/agent";

interface TerminalBlockProps {
  snippet: CommandSnippet;
  className?: string;
}

/** Dark terminal window with a title bar, traffic lights and a copy button. */
export const TerminalBlock = ({ snippet, className }: TerminalBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard blocked (insecure context) — leave the button unchanged. */
    }
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
            copied
              ? "bg-signal-500/15 text-signal-500"
              : "bg-navy-700 text-navy-200 hover:bg-navy-600 hover:text-white",
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
              Copied
            </>
          ) : (
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
