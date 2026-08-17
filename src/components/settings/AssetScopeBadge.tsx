import { Building2, Globe } from "lucide-react";

import { Badge } from "@/components/ui";
import { ORGANIZATION } from "@/data/admin";
import type { AssetFieldEntry } from "@/types/assetFields";

interface AssetScopeBadgeProps {
  entry: AssetFieldEntry;
}

/**
 * Whether a configured entry is offered to every organization or just one.
 * The full `Global — all organizations` label is too long for a table cell,
 * so the pill carries the short form and an icon.
 */
export const AssetScopeBadge = ({ entry }: AssetScopeBadgeProps) =>
  entry.scope === "Global" ? (
    <Badge tone="info">
      <Globe className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      Global
    </Badge>
  ) : (
    <Badge tone="neutral">
      <Building2 className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      {entry.organizationName ?? ORGANIZATION.name}
    </Badge>
  );
