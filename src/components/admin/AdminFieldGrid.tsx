import type { ReactNode } from "react";

export interface AdminField {
  key: string;
  label: string;
  value: ReactNode;
}

/** Three-up label/value grid used by the admin overview panels. */
export const AdminFieldGrid = ({ fields }: { fields: AdminField[] }) => (
  <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
    {fields.map((field) => (
      <div key={field.key} className="min-w-0">
        <dt className="text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
          {field.label}
        </dt>
        <dd className="mt-1.5 text-[13px] leading-relaxed break-words text-heading">
          {field.value}
        </dd>
      </div>
    ))}
  </dl>
);
