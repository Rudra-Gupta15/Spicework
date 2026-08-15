import clsx, { type ClassValue } from "clsx";

/**
 * Conditional className helper used by every component.
 * `cn("p-2", isActive && "bg-brand")` -> "p-2 bg-brand"
 */
export const cn = (...inputs: ClassValue[]): string => clsx(inputs);
