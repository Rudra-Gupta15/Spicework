import type { ReactNode } from "react";

import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CommandSnippet } from "@/types/agent";

import { TerminalBlock } from "./TerminalBlock";

interface DeploymentCardProps {
  title: string;
  subtitle: string;
  snippets: CommandSnippet[];
  /** Optional pill in the header, e.g. a "Recommended" tag. */
  badge?: ReactNode;
  /** Lays the terminals side by side instead of stacked. */
  columns?: boolean;
  className?: string;
}

/** A titled deployment scenario holding one or more terminal snippets. */
export const DeploymentCard = ({
  title,
  subtitle,
  snippets,
  badge,
  columns = false,
  className,
}: DeploymentCardProps) => (
  <Card className={cn("px-5 py-5", className)}>
    <div className="flex flex-wrap items-center gap-2.5">
      <h3 className="text-[17px] font-bold text-heading">{title}</h3>
      {badge}
    </div>
    <p className="mt-1 text-sm text-muted">{subtitle}</p>

    <div
      className={cn(
        "mt-4 gap-4",
        columns ? "grid grid-cols-1 lg:grid-cols-2" : "space-y-4",
      )}
    >
      {snippets.map((snippet) => (
        <TerminalBlock key={snippet.id} snippet={snippet} />
      ))}
    </div>
  </Card>
);
