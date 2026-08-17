import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  Field,
  Input,
  Loader,
  Select,
  Textarea,
} from "@/components/ui";
import {
  LIFECYCLE_STATUSES,
  useLocations,
  useOwners,
} from "@/data/assetConfig";
import {
  emptyLifecycle,
  fetchLifecycle,
  saveLifecycle,
  type LifecycleRecord,
} from "@/data/lifecycle";
import { ApiError } from "@/lib/api";

interface LifecycleTabProps {
  deviceId: string;
  computerName: string;
}

const UNASSIGNED = "— Unassigned —";

/**
 * Assign ownership, location, lifecycle status, purchase and warranty details
 * to an asset. Owner/Location come from the configurable lists (Settings);
 * status is the fixed set. Everything persists through /api/lifecycle, which
 * already stores these fields per asset. Blank on first discovery, status
 * defaults to Active.
 */
export const LifecycleTab = ({ deviceId, computerName }: LifecycleTabProps) => {
  const owners = useOwners();
  const locations = useLocations();

  const [form, setForm] = useState<LifecycleRecord>(() =>
    emptyLifecycle(deviceId, computerName),
  );
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLifecycle(deviceId)
      .then((record) => {
        if (cancelled) return;
        setForm({ ...emptyLifecycle(deviceId, computerName), ...record, mac_address: deviceId });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof ApiError || error instanceof Error
              ? error.message
              : "Could not load this asset's lifecycle details.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId, computerName]);

  const set = useCallback(
    <K extends keyof LifecycleRecord>(key: K, value: LifecycleRecord[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
      setSaved(false);
    },
    [],
  );

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError(undefined);
    try {
      await saveLifecycle({ ...form, mac_address: deviceId, computer_name: computerName });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Could not save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }, [form, deviceId, computerName]);

  if (isLoading) {
    return (
      <Card className="p-8">
        <Loader label="Loading asset details…" />
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-status-offline">{loadError}</p>
      </Card>
    );
  }

  const ownerOptions = [UNASSIGNED, ...owners.map((owner) => owner.name)];
  const locationOptions = [UNASSIGNED, ...locations.map((location) => location.name)];

  return (
    <div className="space-y-5">
      <Card className="px-5 pt-5 pb-6">
        <h2 className="text-base font-bold text-heading">Ownership & Lifecycle</h2>
        <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Owner">
            <Select
              fullWidth
              placeholder="Unassigned"
              options={ownerOptions}
              value={form.owner || UNASSIGNED}
              onChange={(value) => set("owner", value === UNASSIGNED ? "" : value)}
            />
          </Field>
          <Field label="Location">
            <Select
              fullWidth
              placeholder="Unassigned"
              options={locationOptions}
              value={form.location || UNASSIGNED}
              onChange={(value) => set("location", value === UNASSIGNED ? "" : value)}
            />
          </Field>
          <Field label="Lifecycle Status">
            <Select
              fullWidth
              options={LIFECYCLE_STATUSES as unknown as string[]}
              value={form.status || "Active"}
              onChange={(value) => set("status", value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="px-5 pt-5 pb-6">
        <h2 className="text-base font-bold text-heading">Purchase Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Purchase Date">
            <Input
              type="date"
              size="sm"
              value={form.purchase_date}
              onChange={(event) => set("purchase_date", event.target.value)}
            />
          </Field>
          <Field label="Purchase Price">
            <Input
              type="number"
              min="0"
              step="0.01"
              size="sm"
              placeholder="0.00"
              leading={<span className="text-muted">$</span>}
              value={form.purchase_price}
              onChange={(event) => set("purchase_price", event.target.value)}
            />
          </Field>
          <Field label="PO Number">
            <Input
              size="sm"
              placeholder="e.g. PO-2026-0148"
              value={form.po_number}
              onChange={(event) => set("po_number", event.target.value)}
            />
          </Field>
          <Field label="Vendor / Reseller">
            <Input
              size="sm"
              placeholder="e.g. Dell Direct"
              value={form.vendor}
              onChange={(event) => set("vendor", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="px-5 pt-5 pb-6">
        <h2 className="text-base font-bold text-heading">Warranty</h2>
        <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Warranty Provider">
            <Input
              size="sm"
              placeholder="e.g. Dell ProSupport"
              value={form.warranty_provider}
              onChange={(event) => set("warranty_provider", event.target.value)}
            />
          </Field>
          <Field label="Warranty Start Date">
            <Input
              type="date"
              size="sm"
              value={form.warranty_start}
              onChange={(event) => set("warranty_start", event.target.value)}
            />
          </Field>
          <Field label="Warranty End Date">
            <Input
              type="date"
              size="sm"
              value={form.warranty_end}
              onChange={(event) => set("warranty_end", event.target.value)}
            />
          </Field>
          <Field label="Warranty Notes" className="sm:col-span-2 lg:col-span-3">
            <Textarea
              rows={3}
              placeholder="Coverage details, claim references, exclusions…"
              value={form.warranty_notes}
              onChange={(event) => set("warranty_notes", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saveError && <p className="text-[13px] text-status-offline">{saveError}</p>}
        <Button variant="brand" onClick={() => void save()} isLoading={isSaving}>
          {saved ? "Saved" : "Save Asset Details"}
        </Button>
      </div>
    </div>
  );
};
