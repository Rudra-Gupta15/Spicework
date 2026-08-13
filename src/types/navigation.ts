import type { LucideIcon } from "lucide-react";

/** Metadata rendered by the Navbar (page header) for a route. */
export interface PageMeta {
  /** Falls back to the nav item's label when omitted. */
  title?: string;
  subtitle?: string;
}

/** A second-level entry rendered under an expandable parent. */
export interface NavChild extends PageMeta {
  id: string;
  label: string;
  path: string;
}

/** A top-level sidebar entry. Either links somewhere or expands children. */
export interface NavItem extends PageMeta {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Omit when the item only acts as a group toggle. */
  path?: string;
  children?: NavChild[];
}

/** Resolved page metadata for the currently active route. */
export interface ResolvedPageMeta {
  title: string;
  subtitle?: string;
}
