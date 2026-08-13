import { cn } from "@/lib/cn";

type AvatarSize = "sm" | "md";

const SIZES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
};

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

/** First letters of the first and last word, e.g. "Jane Doe" -> "JD". */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts.at(0)?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

/** Initials avatar — swap for an <img> once users have photos. */
export const Avatar = ({ name, size = "md", className }: AvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-600",
      SIZES[size],
      className,
    )}
  >
    {getInitials(name)}
  </span>
);
