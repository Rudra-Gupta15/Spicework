import { cn } from "@/lib/cn";

/**
 * Placeholder for content whose size is known before it arrives — KPI tiles,
 * mostly. Preferred over a <Loader /> wherever a spinner would collapse the
 * layout and make the page jump once the fetch resolves.
 */
export const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      "animate-pulse rounded-xl border border-line bg-surface",
      className,
    )}
  />
);

interface SkeletonTilesProps {
  /** How many placeholders to draw — one per tile the grid will hold. */
  count: number;
  /** Height utility matching the real tile, e.g. "h-[110px]". */
  className?: string;
}

/** A row of identical tile placeholders, for a KPI grid mid-fetch. */
export const SkeletonTiles = ({ count, className }: SkeletonTilesProps) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <Skeleton key={index} className={className} />
    ))}
  </>
);
