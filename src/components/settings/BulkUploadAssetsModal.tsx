import { useCallback, useMemo, useState } from "react";

import { type Column } from "@/components/ui";
import {
  assetExists,
  assetImportFields,
  assetImportTemplate,
  checkAssetRow,
  commitAssetRow,
} from "@/data/assetImport";
import type { ImportRow, ImportSummary } from "@/types/bulkImport";

import { AssetSelectStep } from "./AssetSelectStep";
import { BulkUploadModal } from "./BulkUploadModal";
import {
  importActionColumn,
  importLineColumn,
  importValueColumn,
} from "./bulkImportColumns";

const TEMPLATE_FILENAME = "spiceworks-assets-template.csv";

/**
 * What the preview says about a row before the verdict column: which asset
 * it is, where it will stand and who answers for it. The rest of the file —
 * purchase, warranty, the organization's own columns — is checked all the
 * same, but a table wide enough to show it is a table nobody reads.
 */
const COLUMNS: Column<ImportRow>[] = [
  importLineColumn(),
  {
    key: "asset",
    header: "Asset",
    render: (row) => (
      <div className="min-w-0">
        <p className="font-semibold text-heading">{row.values.name || "—"}</p>
        <p className="text-[13px] text-muted">
          {row.values.manufacturer || "—"} · {row.values.serialNumber || "—"}
        </p>
      </div>
    ),
  },
  importValueColumn("type", "Type"),
  importValueColumn("site", "Site"),
  importValueColumn("owner", "Owner"),
  importValueColumn("lifecycleStatus", "Lifecycle"),
  importActionColumn(),
];

interface BulkUploadAssetsModalProps {
  onClose: () => void;
  /** Fired each time a run finishes, so the caller can refresh its list. */
  onFinished: (summary: ImportSummary) => void;
}

/**
 * "Bulk Upload → Assets". The same flow the user import uses, pointed at the
 * estate instead of the roster: kit the agent cannot discover on its own is
 * entered here along with the paperwork that never appears in a scan, and
 * the same file can be sent back later to update what it brought in.
 */
export const BulkUploadAssetsModal = ({
  onClose,
  onFinished,
}: BulkUploadAssetsModalProps) => {
  /* The sites, owners, locations and custom fields a row may name are read
     when the dialog opens, so a location added a minute ago is offered. */
  const fields = useMemo(() => assetImportFields(), []);

  /* Serial numbers of the assets ticked on the first step, lower-cased —
     the same key a row is matched on. Empty means the file stands alone. */
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /**
   * A picked-out selection is the point of the upload: whatever the file
   * says, only those assets are touched. A row about anything else is named
   * and left alone rather than quietly applied.
   */
  const check = useCallback(
    (values: Record<string, string>) => {
      const failure = checkAssetRow(values);
      if (failure) return failure;

      if (selected.size === 0) return undefined;

      return selected.has((values.serialNumber ?? "").toLowerCase())
        ? undefined
        : "Not one of the assets you picked.";
    },
    [selected],
  );

  return (
    <BulkUploadModal
      title="Bulk Upload Assets"
      description="Add several assets at once, or send the same file back to update them. Anything the agent has not scanned stays as you enter it."
      noun={{ one: "Asset", many: "Assets" }}
      fields={fields}
      templateFilename={TEMPLATE_FILENAME}
      templateRows={assetImportTemplate}
      columns={COLUMNS}
      exists={assetExists}
      check={check}
      commit={commitAssetRow}
      onFinished={onFinished}
      onClose={onClose}
      scope={{
        children: (
          <AssetSelectStep selected={selected} onChange={setSelected} />
        ),
        count: selected.size,
        summary: `${selected.size} picked`,
      }}
      requirements={
        <p className="text-[11px] text-muted">
          A new asset lands Offline with nothing scanned on it — the first
          agent scan fills in its IP address, OS and hardware. Owners,
          locations and the organization&apos;s own columns come from Settings
          → Asset Fields, so a file can only name ones that exist there.
        </p>
      }
    />
  );
};
