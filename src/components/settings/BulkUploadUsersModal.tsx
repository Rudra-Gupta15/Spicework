import { useMemo } from "react";

import { type Column } from "@/components/ui";
import {
  checkUserRow,
  commitUserRow,
  userExists,
  userImportFields,
  userImportTemplate,
} from "@/data/userImport";
import type { ImportRow, ImportSummary } from "@/types/bulkImport";

import { BulkUploadModal } from "./BulkUploadModal";
import {
  importActionColumn,
  importLineColumn,
  importValueColumn,
} from "./bulkImportColumns";

const TEMPLATE_FILENAME = "spiceworks-users-template.csv";

const COLUMNS: Column<ImportRow>[] = [
  importLineColumn(),
  {
    key: "user",
    header: "User",
    render: (row) => (
      <div className="min-w-0">
        <p className="font-semibold text-heading">{row.values.name || "—"}</p>
        <p className="text-[13px] text-muted">{row.values.email || "—"}</p>
      </div>
    ),
  },
  importValueColumn("role", "Role"),
  importValueColumn("site", "Site"),
  importActionColumn(),
];

interface BulkUploadUsersModalProps {
  onClose: () => void;
  /** Fired each time a run finishes, so the caller can refresh its list. */
  onFinished: (summary: ImportSummary) => void;
}

/**
 * "Bulk Upload → Users" on the Team Members screen. Every row is checked
 * against the rules the invite dialog enforces, so the file is only a
 * different way in, never a way around them — and the same file sent back
 * later moves people between sites or changes what they may do.
 */
export const BulkUploadUsersModal = ({
  onClose,
  onFinished,
}: BulkUploadUsersModalProps) => {
  const fields = useMemo(() => userImportFields(), []);

  return (
    <BulkUploadModal
      title="Bulk Upload Users"
      description="Invite several people at once, or send the same file back to change their role or site. Everyone new lands as Invited, exactly as they would from the invite dialog."
      noun={{ one: "User", many: "Users" }}
      fields={fields}
      templateFilename={TEMPLATE_FILENAME}
      templateRows={userImportTemplate}
      columns={COLUMNS}
      exists={userExists}
      check={checkUserRow}
      commit={commitUserRow}
      onFinished={onFinished}
      onClose={onClose}
    />
  );
};
