import { cn } from "@/lib/cn";

type AvatarSize = "sm" | "md";

const SIZES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
};

/**
 * Fill colours for `variant="auto"`. Fixed order — an author always gets
 * the same colour, so a timeline reads consistently.
 */
const AUTO_FILLS = [
  "bg-brand text-white",
  "bg-auth-panel text-white",
  "bg-chart-bar text-white",
  "bg-chart-3 text-white",
  "bg-chart-4 text-white",
];

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  /** `auto` colours the circle from the name; `brand` is the default tint. */
  variant?: "brand" | "auto";
  className?: string;
}

/** Stable index into `AUTO_FILLS` for a name. */
const getFill = (name: string): string => {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AUTO_FILLS[sum % AUTO_FILLS.length];
};

/** First letters of the first and last word, e.g. "Jane Doe" -> "JD". */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts.at(0)?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

/** Initials avatar — swap for an <img> once users have photos. */
export const Avatar = ({
  name,
  size = "md",
  variant = "brand",
  className,
}: AvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid shrink-0 place-items-center rounded-full font-semibold",
      variant === "auto"
        ? getFill(name)
        : "bg-brand-100 text-brand-600",
      SIZES[size],
      className,
    )}
  >
    {getInitials(name)}
  </span>
);
