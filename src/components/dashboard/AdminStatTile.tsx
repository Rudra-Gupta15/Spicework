import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/cn";
import type { DashboardTile } from "@/data/adminDashboard";

/**
 * The dashboard's stat tiles. Every accent on them is the app's one brand
 * orange — the tiles are told apart by their label and icon, not by colour,
 * so the row stays consistent with the rest of the app.
 *
 * A tile that opens a list is a link and reacts to hover; one that is just a
 * number sits still, so the two are never confused.
 */
export const AdminStatTile = ({ tile }: { tile: DashboardTile }) => {
  const { label, value, hint, icon: Icon, to } = tile;

  const card = (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-card",
        to &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgb(16_24_40/0.08)]",
      )}
    >
      {/* A single hairline along the bottom edge, wiping in from the left, so
          the list you are about to open announces itself without the card's
          own border changing colour. */}
      {to && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand-500 transition-transform duration-300 group-hover:scale-x-100"
        />
      )}

      {/* Soft wash behind the icon; blurred so it never competes with the
          number, which is what the tile is actually for. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-brand-50 opacity-60 blur-2xl"
      />

      <div className="relative flex items-center gap-3.5">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100",
            to && "transition-transform duration-200 group-hover:scale-105",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold tracking-[0.07em] text-muted uppercase">
            {label}
          </p>
          <p className="mt-1.5 text-[28px] leading-none font-bold text-heading tabular-nums">
            {value}
          </p>
        </div>
      </div>

      {/* Parked in the corner rather than in the row above, so the longest
          label still gets the full width to itself. */}
      {to && (
        <ArrowRight
          className={cn(
            "absolute top-5 right-5 h-4 w-4 -translate-x-1 text-brand-600 opacity-0 transition-all duration-200",
            "group-hover:translate-x-0 group-hover:opacity-100",
          )}
          strokeWidth={2.4}
          aria-hidden="true"
        />
      )}

      <p className="relative mt-4 text-[12px] leading-snug text-muted">{hint}</p>
    </div>
  );

  if (!to) return card;

  return (
    <Link
      to={to}
      aria-label={`${label}: ${value}`}
      className="group block rounded-xl"
    >
      {card}
    </Link>
  );
};
