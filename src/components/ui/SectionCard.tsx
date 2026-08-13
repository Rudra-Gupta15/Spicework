import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Card } from "./Card";

interface SectionCardProps {
  title: string;
  /** Right-aligned slot in the card header (link, select, menu…). */
  action?: ReactNode;
  /** Removes the body padding — used when a table bleeds to the edges. */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Card with a titled header — the container for every dashboard panel. */
export const SectionCard = ({
  title,
  action,
  flush = false,
  className,
  bodyClassName,
  children,
}: SectionCardProps) => (
  <Card className={cn("flex flex-col", className)}>
    <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
      <h2 className="text-base font-bold text-heading">{title}</h2>
      {action}
    </div>

    <div className={cn("flex-1", !flush && "px-5 pb-5", bodyClassName)}>
      {children}
    </div>
  </Card>
);
