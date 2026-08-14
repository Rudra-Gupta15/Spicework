import { cn } from "@/lib/cn";
import type { LogAuthorKind } from "@/types/log";

/** Soft tint pairs for person avatars, chosen by name. */
const SOFT_FILLS = [
  "bg-purple-100 text-purple-600",
  "bg-blue-100 text-blue-600",
  "bg-teal-100 text-teal-600",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-600",
];

/** Automated events always read green, so the scanner is easy to scan for. */
const AUTOMATED_FILL = "bg-green-100 text-green-700";

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts.at(0)?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

const fillFor = (name: string): string => {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return SOFT_FILLS[sum % SOFT_FILLS.length];
};

interface LogAvatarProps {
  name: string;
  kind: LogAuthorKind;
}

/** Initials badge for a log entry's author. */
export const LogAvatar = ({ name, kind }: LogAvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold",
      kind === "automated" ? AUTOMATED_FILL : fillFor(name),
    )}
  >
    {/* The scanner reads as a single "A", however it is named. */}
    {kind === "automated" ? name.trim()[0]?.toUpperCase() : initials(name)}
  </span>
);
