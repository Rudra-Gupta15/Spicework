import { useState, type ReactNode } from "react";
import { ArrowLeftRight, Lock } from "lucide-react";

import { Badge, Card, Field, Select } from "@/components/ui";
import {
  DEFAULT_LIFECYCLE_STATUS,
  LIFECYCLE_STATUSES,
  LIFECYCLE_STATUS_META,
} from "@/data/assetFields";
import type { LifecycleStatus } from "@/types/assetFields";

/** A note the panel repeats twice — kept in one place. */
const NoteCard = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <Card className="flex gap-3 px-5 py-4">
    <span
      aria-hidden="true"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas text-muted"
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-heading">{title}</p>
      <p className="mt-0.5 text-[13px] text-muted">{children}</p>
    </div>
  </Card>
);

/**
 * Lifecycle Status, read-only. Unlike owners and locations this list is
 * fixed by the product, so the panel explains the values rather than
 * offering to change them — there is no add, edit or remove here on purpose.
 */
export const AssetLifecycleSettings = () => {
  /* The preview is a live control so the dropdown can be tried out, but it
     is bound to nothing — closing the screen forgets it. */
  const [preview, setPreview] = useState<LifecycleStatus>(
    DEFAULT_LIFECYCLE_STATUS,
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <NoteCard icon={<Lock className="h-4 w-4" strokeWidth={2.1} />} title="Fixed list">
          These six values ship with the product and cannot be added to,
          renamed or removed.
        </NoteCard>

        <NoteCard
          icon={<ArrowLeftRight className="h-4 w-4" strokeWidth={2.1} />}
          title="Free-form transitions"
        >
          Any status can move to any other one — nothing here enforces an
          order, so a Disposed asset can be set back to Active if it was
          logged in error.
        </NoteCard>
      </div>

      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">Lifecycle Statuses</h2>
        <p className="mt-1 text-[13px] text-muted">
          What each value means on an asset record.
        </p>

        <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
          {LIFECYCLE_STATUSES.map((status) => {
            const meta = LIFECYCLE_STATUS_META[status];
            const isDefault = status === DEFAULT_LIFECYCLE_STATUS;

            return (
              <li
                key={status}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5"
              >
                <Badge tone={meta.tone} className="min-w-[112px] justify-center">
                  {status}
                </Badge>

                <p className="min-w-[200px] flex-1 text-[13px] text-muted">
                  {meta.description}
                </p>

                {isDefault && (
                  <span className="rounded-md border border-brand/30 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-brand-600 uppercase">
                    Default on discovery
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">Asset Form Preview</h2>
        <p className="mt-1 text-[13px] text-muted">
          How the field appears on an asset. A freshly discovered asset opens
          on {DEFAULT_LIFECYCLE_STATUS}.
        </p>

        <Field
          className="mt-4 max-w-[320px]"
          label="Lifecycle Status"
          htmlFor="lifecycle-preview"
        >
          <Select
            id="lifecycle-preview"
            size="lg"
            fullWidth
            options={LIFECYCLE_STATUSES}
            value={preview}
            onChange={(value) => setPreview(value as LifecycleStatus)}
            aria-label="Lifecycle status preview"
          />
        </Field>
      </Card>
    </div>
  );
};
