import type { DetailField } from "@/types/hardware";

/** One rule per four fields, so the grid reads as a table of rows. */
const ROW_SIZE = 4;

const chunk = (fields: DetailField[]): DetailField[][] => {
  const rows: DetailField[][] = [];
  for (let i = 0; i < fields.length; i += ROW_SIZE)
    rows.push(fields.slice(i, i + ROW_SIZE));
  return rows;
};

interface DetailFieldGridProps {
  fields: DetailField[];
}

/** Four-up label/value grid used by the device detail tabs. */
export const DetailFieldGrid = ({ fields }: DetailFieldGridProps) => (
  <dl>
    {chunk(fields).map((row) => (
      <div
        key={row[0].key}
        className="grid grid-cols-1 gap-x-6 gap-y-5 border-b border-line py-4 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-2 xl:grid-cols-4"
      >
        {row.map((field) => (
          <div key={field.key} className="min-w-0">
            <dt className="text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
              {field.label}
            </dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed break-words whitespace-pre-line text-heading">
              {field.dot && (
                <span
                  aria-hidden="true"
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle"
                />
              )}
              {field.value}

              {field.note && (
                <span className="mt-1 block text-[11px] leading-snug text-muted">
                  {field.note}
                </span>
              )}
            </dd>
          </div>
        ))}
      </div>
    ))}
  </dl>
);
