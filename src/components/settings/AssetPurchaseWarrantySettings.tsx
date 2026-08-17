import { useState } from "react";

import {
  Card,
  DataTable,
  Field,
  Input,
  Select,
  Textarea,
  type Column,
} from "@/components/ui";
import {
  ASSET_FIELD_DEFAULTS,
  CURRENCY_OPTIONS,
  PURCHASE_FIELD_SPECS,
  WARRANTY_FIELD_SPECS,
  blankAssetFields,
  setDefaultCurrency,
} from "@/data/assetFields";
import type { AssetFieldSpec } from "@/types/assetFields";

/**
 * `DataTable` holds its table at 700px so the wide inventory lists scroll
 * rather than crush; three columns in a half-width card do not need that,
 * and the descendant selector outranks the base class.
 */
const NARROW_TABLE = "[&_table]:min-w-[420px]";

const SPEC_COLUMNS: Column<AssetFieldSpec>[] = [
  {
    key: "label",
    header: "Field",
    cellClassName: "font-semibold text-heading",
  },
  { key: "control", header: "Input", cellClassName: "text-muted" },
  {
    key: "firstDiscovery",
    header: "On first discovery",
    cellClassName: "text-muted",
  },
];

/**
 * Purchase and warranty details have no configurable list behind them —
 * every field is free entry and every one of them starts blank. So this
 * panel does the two things that are left: it holds the one setting the
 * fields need (what currency a price is entered in), and it documents what
 * the asset form will ask for.
 */
export const AssetPurchaseWarrantySettings = () => {
  const [currency, setCurrency] = useState(ASSET_FIELD_DEFAULTS.currency);

  /* Preview only — nothing here is attached to an asset. Starting from the
     real blank record is the point: this is what a just-discovered asset
     looks like. */
  const [preview, setPreview] = useState(() => blankAssetFields());

  const changeCurrency = (next: string) => {
    setDefaultCurrency(next);
    setCurrency(next);
    setPreview((current) => ({
      ...current,
      purchase: { ...current.purchase, currency: next },
    }));
  };

  const setPurchase = (key: keyof typeof preview.purchase, value: string) =>
    setPreview((current) => ({
      ...current,
      purchase: { ...current.purchase, [key]: value },
    }));

  const setWarranty = (key: keyof typeof preview.warranty, value: string) =>
    setPreview((current) => ({
      ...current,
      warranty: { ...current.warranty, [key]: value },
    }));

  return (
    <div className="space-y-5">
      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">Default Currency</h2>
        <p className="mt-1 text-[13px] text-muted">
          Purchase Price is a number plus a currency. New price fields open in
          this one; whoever records the purchase can still change it per asset.
        </p>

        <Field
          className="mt-4 max-w-[260px]"
          label="Purchase Price Currency"
          htmlFor="default-currency"
        >
          <Select
            id="default-currency"
            size="lg"
            fullWidth
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={changeCurrency}
            aria-label="Default purchase price currency"
          />
        </Field>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="px-5 py-5">
          <h2 className="text-base font-bold text-heading">
            Purchase Information
          </h2>
          <p className="mt-1 mb-4 text-[13px] text-muted">
            Recorded per asset to track cost and procurement.
          </p>

          <DataTable
            columns={SPEC_COLUMNS}
            rows={PURCHASE_FIELD_SPECS}
            rowKey={(spec) => spec.id}
            uppercaseHeaders
            bordered
            dense
            className={NARROW_TABLE}
          />
        </Card>

        <Card className="px-5 py-5">
          <h2 className="text-base font-bold text-heading">
            Warranty Information
          </h2>
          <p className="mt-1 mb-4 text-[13px] text-muted">
            Recorded per asset to track coverage and expiry.
          </p>

          <DataTable
            columns={SPEC_COLUMNS}
            rows={WARRANTY_FIELD_SPECS}
            rowKey={(spec) => spec.id}
            uppercaseHeaders
            bordered
            dense
            className={NARROW_TABLE}
          />
        </Card>
      </div>

      <Card className="px-5 py-5">
        <h2 className="text-base font-bold text-heading">Asset Form Preview</h2>
        <p className="mt-1 text-[13px] text-muted">
          Exactly what a just-discovered asset shows — every field empty until
          somebody fills it in. Nothing typed here is saved.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <Field label="Purchase Date" htmlFor="preview-purchase-date">
            <Input
              id="preview-purchase-date"
              type="date"
              value={preview.purchase.purchaseDate}
              onChange={(event) =>
                setPurchase("purchaseDate", event.target.value)
              }
            />
          </Field>

          <Field label="Purchase Price" htmlFor="preview-purchase-price">
            <div className="flex gap-2">
              <Input
                id="preview-purchase-price"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={preview.purchase.purchasePrice}
                onChange={(event) =>
                  setPurchase("purchasePrice", event.target.value)
                }
                placeholder="0.00"
              />
              <Select
                size="lg"
                options={CURRENCY_OPTIONS}
                value={preview.purchase.currency}
                onChange={(value) => setPurchase("currency", value)}
                aria-label="Currency"
                className="shrink-0"
              />
            </div>
          </Field>

          <Field label="Purchase Order (PO) Number" htmlFor="preview-po">
            <Input
              id="preview-po"
              value={preview.purchase.poNumber}
              onChange={(event) => setPurchase("poNumber", event.target.value)}
              placeholder="e.g. PO-2026-0148"
            />
          </Field>

          <Field label="Vendor / Reseller" htmlFor="preview-vendor">
            <Input
              id="preview-vendor"
              value={preview.purchase.vendor}
              onChange={(event) => setPurchase("vendor", event.target.value)}
              placeholder="e.g. Redington India"
            />
          </Field>

          <Field label="Warranty Provider" htmlFor="preview-warranty-provider">
            <Input
              id="preview-warranty-provider"
              value={preview.warranty.provider}
              onChange={(event) => setWarranty("provider", event.target.value)}
              placeholder="e.g. Dell ProSupport"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Warranty Start" htmlFor="preview-warranty-start">
              <Input
                id="preview-warranty-start"
                type="date"
                value={preview.warranty.startDate}
                onChange={(event) => setWarranty("startDate", event.target.value)}
              />
            </Field>

            <Field label="Warranty End" htmlFor="preview-warranty-end">
              <Input
                id="preview-warranty-end"
                type="date"
                value={preview.warranty.endDate}
                onChange={(event) => setWarranty("endDate", event.target.value)}
              />
            </Field>
          </div>

          <Field
            className="sm:col-span-2"
            label="Warranty Notes"
            htmlFor="preview-warranty-notes"
          >
            <Textarea
              id="preview-warranty-notes"
              rows={3}
              value={preview.warranty.notes}
              onChange={(event) => setWarranty("notes", event.target.value)}
              placeholder="Coverage terms, claim reference, on-site response window…"
            />
          </Field>
        </div>
      </Card>
    </div>
  );
};
