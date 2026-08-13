import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/** White surface with the app's standard border, radius and elevation. */
export const Card = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-line bg-surface shadow-card",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
