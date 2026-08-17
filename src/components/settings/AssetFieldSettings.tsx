import { useState } from "react";

import { DetailTabs } from "@/components/common/DetailTabs";

import { AssetLifecycleSettings } from "./AssetLifecycleSettings";
import { AssetLocationSettings } from "./AssetLocationSettings";
import { AssetOwnerSettings } from "./AssetOwnerSettings";
import { AssetPurchaseWarrantySettings } from "./AssetPurchaseWarrantySettings";

/**
 * Owners and Locations first — they are the two lists this screen exists to
 * manage. Lifecycle and the purchase/warranty fields follow because they are
 * read-only reference, not configuration.
 */
const ASSET_FIELD_TABS = [
  "Owners",
  "Locations",
  "Lifecycle Status",
  "Purchase & Warranty",
] as const;

type AssetFieldTab = (typeof ASSET_FIELD_TABS)[number];

/**
 * Settings → Asset Fields. Everything behind the manual fields on an asset:
 * the owner and location dropdowns the organization defines for itself, and
 * the fields it cannot define — lifecycle status, purchase and warranty.
 */
export const AssetFieldSettings = () => {
  const [tab, setTab] = useState<AssetFieldTab>("Owners");

  return (
    <div>
      <DetailTabs tabs={ASSET_FIELD_TABS} active={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === "Owners" && <AssetOwnerSettings />}
        {tab === "Locations" && <AssetLocationSettings />}
        {tab === "Lifecycle Status" && <AssetLifecycleSettings />}
        {tab === "Purchase & Warranty" && <AssetPurchaseWarrantySettings />}
      </div>
    </div>
  );
};
