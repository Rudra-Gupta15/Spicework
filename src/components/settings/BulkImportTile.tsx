import { cn } from "@/lib/cn";

interface BulkImportTileProps {
  value: number;
  label: string;
  /** Colour is only spent on a figure that is actually saying something. */
  tone: "good" | "bad" | "plain";
}

/** One figure of an import tally — the same tile on Validate and on Done. */
export const BulkImportTile = ({ value, label, tone }: BulkImportTileProps) => (
  <div className="rounded-lg border border-line bg-canvas px-3 py-2.5 text-center">
    <p
      className={cn(
        "text-xl font-bold tabular-nums",
        value === 0 || tone === "plain"
          ? "text-heading"
          : tone === "good"
            ? "text-status-online"
            : "text-status-offline",
      )}
    >
      {value}
    </p>
    <p className="mt-0.5 text-[11px] text-muted">{label}</p>
  </div>
);
