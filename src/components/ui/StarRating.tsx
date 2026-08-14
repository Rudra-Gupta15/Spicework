import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

type StarSize = "sm" | "md";

const SIZES: Record<StarSize, string> = {
  sm: "h-4 w-4",
  md: "h-[22px] w-[22px]",
};

interface StarRatingProps {
  /** Filled stars, 0 to `max`. */
  value: number;
  max?: number;
  /** Omit to render a read-only rating. */
  onChange?: (value: number) => void;
  size?: StarSize;
  className?: string;
}

/** Five-star rating — interactive when `onChange` is supplied. */
export const StarRating = ({
  value,
  max = 5,
  onChange,
  size = "md",
  className,
}: StarRatingProps) => {
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  const star = (position: number) => (
    <Star
      className={cn(
        SIZES[size],
        position <= value ? "fill-brand text-brand" : "text-navy-200",
      )}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );

  if (!onChange) {
    return (
      <span
        role="img"
        aria-label={`Rated ${value} out of ${max}`}
        className={cn("flex items-center gap-1", className)}
      >
        {stars.map((position) => (
          <span key={position}>{star(position)}</span>
        ))}
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-1", className)}>
      {stars.map((position) => (
        <button
          key={position}
          type="button"
          aria-label={`Rate ${position} out of ${max}`}
          aria-pressed={position === value}
          onClick={() => onChange(position)}
          className="rounded transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          {star(position)}
        </button>
      ))}
    </span>
  );
};
