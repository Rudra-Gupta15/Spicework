import type { ImportField, ImportRow } from "@/types/bulkImport";
import type { AssetFieldValues, LifecycleStatus } from "@/types/assetFields";

import { ADMIN_SITES } from "./admin";
import {
  ASSET_FIELD_DEFAULTS,
  CURRENCY_OPTIONS,
  DEFAULT_LIFECYCLE_STATUS,
  LIFECYCLE_STATUSES,
  blankAssetFields,
  customFieldsInScope,
  findLocationByName,
  findOwnerByName,
  locationsInScope,
  ownersInScope,
} from "./assetFields";
import {
  UNASSIGNED,
  addDevice,
  findDeviceBySerial,
  updateDevice,
} from "./hardware";

/**
 * Assets, as a bulk upload sees them.
 *
 * The agent finds most kit on its own, but not all of it: a printer nobody
 * can install software on, a switch, a laptop still in its box, and none of
 * the paperwork — who owns it, what it cost, when the warranty runs out.
 * That is what a file is for. Every column below is checked against the same
 * rules the asset form enforces, so the file is a different way in and never
 * a way around them.
 */

/**
 * What an asset can be. Fixed rather than derived from the current estate —
 * a file has to be able to bring in the first switch this organization owns.
 */
export const ASSET_TYPE_OPTIONS: readonly string[] = [
  "Laptop",
  "Desktop",
  "Server",
  "Printer",
  "Switch",
  "Router",
  "Firewall",
  "Monitor",
  "Mobile",
  "Tablet",
  "Other",
];

/** Prefix that marks a field as one of the organization's own columns. */
const CUSTOM_PREFIX = "custom:";

/**
 * The approved shape of an asset file, in template order.
 *
 * Built on demand rather than declared once: the sites, owners, locations
 * and custom fields a row is allowed to name are whatever Settings holds
 * right now, and a list captured at module load would go stale the moment
 * somebody adds a location.
 */
export const assetImportFields = (): ImportField[] => [
  {
    key: "name",
    label: "Name",
    type: "text",
    group: "Identity",
    required: true,
    aliases: ["device name", "asset name", "hostname"],
    hint: "Dell Latitude 5450",
  },
  {
    key: "type",
    label: "Type",
    type: "enum",
    group: "Identity",
    required: true,
    options: ASSET_TYPE_OPTIONS,
    aliases: ["asset type", "device type", "category"],
  },
  {
    key: "manufacturer",
    label: "Manufacturer",
    type: "text",
    group: "Identity",
    required: true,
    aliases: ["make", "brand", "vendor name"],
  },
  {
    key: "serialNumber",
    label: "Serial Number",
    type: "text",
    group: "Identity",
    required: true,
    identifier: true,
    aliases: ["serial", "serial no", "service tag", "sn"],
    hint: "How a row is matched to an asset already on the books",
  },
  {
    key: "site",
    label: "Site",
    type: "enum",
    group: "Placement",
    required: true,
    options: ADMIN_SITES.map((site) => site.name),
    aliases: ["office", "branch"],
  },
  {
    key: "assignedTo",
    label: "Assigned To",
    type: "text",
    group: "Placement",
    fallback: UNASSIGNED,
    aliases: ["assigned", "user", "holder"],
    hint: "Leave blank for kit nobody has been handed yet",
  },
  {
    key: "owner",
    label: "Owner",
    type: "enum",
    group: "Placement",
    options: ownersInScope().map((owner) => owner.name),
    aliases: ["asset owner", "responsible", "custodian"],
  },
  {
    key: "location",
    label: "Location",
    type: "enum",
    group: "Placement",
    options: locationsInScope().map((location) => location.name),
    aliases: ["asset location", "placement", "room"],
  },
  {
    key: "lifecycleStatus",
    label: "Lifecycle Status",
    type: "enum",
    group: "Lifecycle",
    options: LIFECYCLE_STATUSES,
    fallback: DEFAULT_LIFECYCLE_STATUS,
    aliases: ["lifecycle", "asset status", "state"],
  },
  {
    key: "purchaseDate",
    label: "Purchase Date",
    type: "date",
    group: "Purchase",
    aliases: ["bought on", "invoice date"],
    hint: "dd/mm/yyyy or yyyy-mm-dd",
  },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    type: "money",
    group: "Purchase",
    aliases: ["price", "cost", "amount"],
  },
  {
    key: "currency",
    label: "Currency",
    type: "enum",
    group: "Purchase",
    options: CURRENCY_OPTIONS,
    fallback: ASSET_FIELD_DEFAULTS.currency,
  },
  {
    key: "poNumber",
    label: "PO Number",
    type: "text",
    group: "Purchase",
    aliases: ["purchase order", "po", "purchase order number"],
  },
  {
    key: "vendor",
    label: "Vendor",
    type: "text",
    group: "Purchase",
    aliases: ["reseller", "supplier", "vendor / reseller"],
  },
  {
    key: "warrantyProvider",
    label: "Warranty Provider",
    type: "text",
    group: "Warranty",
    aliases: ["warranty vendor", "support provider"],
  },
  {
    key: "warrantyStart",
    label: "Warranty Start Date",
    type: "date",
    group: "Warranty",
    aliases: ["warranty start", "cover from"],
  },
  {
    key: "warrantyEnd",
    label: "Warranty End Date",
    type: "date",
    group: "Warranty",
    aliases: ["warranty end", "warranty expiry", "cover until"],
  },
  {
    key: "warrantyNotes",
    label: "Warranty Notes",
    type: "text",
    group: "Warranty",
    aliases: ["warranty note", "cover notes"],
  },

  /* The organization's own columns come last, in the order Settings holds
     them — a file that carries none of them is unaffected by their being
     offered. */
  ...customFieldsInScope().map<ImportField>((field) => ({
    key: `${CUSTOM_PREFIX}${field.id}`,
    label: field.label,
    type: field.type === "select" ? "enum" : field.type,
    group: "Custom Fields",
    options: field.options,
    hint: field.description,
  })),
];

/** Whether an asset with this serial number is already on the books. */
export const assetExists = (serialNumber: string): boolean =>
  findDeviceBySerial(serialNumber) !== undefined;

/**
 * The rules a single column cannot carry on its own. Everything else — the
 * approved types, the known sites, a date that is really a date — is settled
 * by the field definitions above before this is reached.
 */
export const checkAssetRow = (
  values: Record<string, string>,
): string | undefined => {
  const start = values.warrantyStart ?? "";
  const end = values.warrantyEnd ?? "";

  if (start !== "" && end !== "" && end < start)
    return "Warranty ends before it starts.";

  if ((values.purchasePrice ?? "") !== "" && (values.purchaseDate ?? "") === "")
    return "A purchase price needs the date it was bought on.";

  return undefined;
};

/** Only the columns the file carried; a blank means "leave this alone". */
const said = (values: Record<string, string>, key: string): string | undefined =>
  values[key] !== undefined && values[key] !== "" ? values[key] : undefined;

/**
 * Folds an uploaded row into the manual fields of an asset. Called with the
 * asset's current values on an update, so a file that mentions the warranty
 * and nothing else leaves the purchase details where they were.
 */
const mergeAssetFields = (
  values: Record<string, string>,
  current: AssetFieldValues,
): AssetFieldValues => {
  const owner = said(values, "owner");
  const location = said(values, "location");
  const lifecycle = said(values, "lifecycleStatus");

  const custom = { ...current.custom };

  Object.entries(values).forEach(([key, value]) => {
    if (key.startsWith(CUSTOM_PREFIX) && value !== "")
      custom[key.slice(CUSTOM_PREFIX.length)] = value;
  });

  return {
    ownerId: owner ? (findOwnerByName(owner)?.id ?? current.ownerId) : current.ownerId,
    locationId: location
      ? (findLocationByName(location)?.id ?? current.locationId)
      : current.locationId,
    lifecycleStatus: (lifecycle as LifecycleStatus | undefined) ?? current.lifecycleStatus,
    purchase: {
      purchaseDate: said(values, "purchaseDate") ?? current.purchase.purchaseDate,
      purchasePrice: said(values, "purchasePrice") ?? current.purchase.purchasePrice,
      currency: said(values, "currency") ?? current.purchase.currency,
      poNumber: said(values, "poNumber") ?? current.purchase.poNumber,
      vendor: said(values, "vendor") ?? current.purchase.vendor,
    },
    warranty: {
      provider: said(values, "warrantyProvider") ?? current.warranty.provider,
      startDate: said(values, "warrantyStart") ?? current.warranty.startDate,
      endDate: said(values, "warrantyEnd") ?? current.warranty.endDate,
      notes: said(values, "warrantyNotes") ?? current.warranty.notes,
    },
    custom,
  };
};

/**
 * Writes one checked row. Returns a message to fail just this row — the rest
 * of the file carries on, which is the whole point of committing them one at
 * a time rather than in a single pass.
 */
export const commitAssetRow = (row: ImportRow): string | undefined => {
  const { values } = row;

  if (row.action === "update") {
    const device = findDeviceBySerial(values.serialNumber ?? "");
    if (!device) return "That asset is no longer on the books.";

    updateDevice(device.id, {
      name: said(values, "name"),
      type: said(values, "type"),
      manufacturer: said(values, "manufacturer"),
      /* The inventory calls the site an asset stands at its location; the
         finer placement lives on the asset fields beside the owner. */
      location: said(values, "site"),
      assignedTo: said(values, "assignedTo"),
      fields: mergeAssetFields(values, device.fields ?? blankAssetFields()),
    });

    return undefined;
  }

  if (assetExists(values.serialNumber ?? ""))
    return "Something else claimed that serial number while this file was running.";

  addDevice({
    name: values.name,
    type: values.type,
    manufacturer: values.manufacturer,
    serialNumber: values.serialNumber,
    location: values.site,
    assignedTo: values.assignedTo || UNASSIGNED,
    fields: mergeAssetFields(values, blankAssetFields()),
  });

  return undefined;
};

/**
 * Example rows for the downloadable template, filled in with this
 * organization's real sites, owners and locations so the first upload does
 * not fail on names that were only ever placeholders.
 */
export const assetImportTemplate = (): string[][] => {
  const fields = assetImportFields();
  const sites = ADMIN_SITES.map((site) => site.name);
  const owner = ownersInScope()[0]?.name ?? "";
  const location = locationsInScope()[0]?.name ?? "";

  const examples: Record<string, string>[] = [
    {
      name: "Dell Latitude 5450",
      type: "Laptop",
      manufacturer: "Dell Inc.",
      serialNumber: "SN-DL5450-0001",
      site: sites[0] ?? "",
      assignedTo: "Priya Sharma",
      owner,
      location,
      lifecycleStatus: "Active",
      purchaseDate: "12/04/2026",
      purchasePrice: "82500",
      currency: CURRENCY_OPTIONS[0],
      poNumber: "PO-2026-0181",
      vendor: "Redington India",
      warrantyProvider: "Dell ProSupport",
      warrantyStart: "12/04/2026",
      warrantyEnd: "11/04/2029",
      warrantyNotes: "Next business day on site",
    },
    {
      name: "HP LaserJet M404",
      type: "Printer",
      manufacturer: "HP Inc.",
      serialNumber: "SN-HP-M404-0002",
      site: sites[1] ?? sites[0] ?? "",
      lifecycleStatus: "In Storage",
      purchaseDate: "03/02/2026",
      purchasePrice: "24990",
      currency: CURRENCY_OPTIONS[0],
      vendor: "Ingram Micro",
      warrantyEnd: "02/02/2028",
    },
    {
      name: "Cisco Catalyst 9300",
      type: "Switch",
      manufacturer: "Cisco Systems",
      serialNumber: "SN-CC9300-0003",
      site: sites[0] ?? "",
      assignedTo: "Network Team",
      owner,
      lifecycleStatus: "Active",
      warrantyProvider: "Cisco Smart Net",
      warrantyStart: "20/01/2026",
      warrantyEnd: "19/01/2031",
    },
  ];

  return examples.map((example) =>
    fields.map((field) => example[field.key] ?? ""),
  );
};
