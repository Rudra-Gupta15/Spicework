import { api } from "@/lib/api";

/** Mirrors backend LifecycleData / asset_lifecycle_v2 (backend/routers/lifecycle.py). */
export interface LifecycleRecord {
  mac_address: string;
  computer_name: string;
  owner: string;
  location: string;
  /** Fixed lifecycle status — see LIFECYCLE_STATUSES. */
  status: string;
  purchase_date: string;
  purchase_price: string;
  po_number: string;
  vendor: string;
  warranty_provider: string;
  warranty_start: string;
  warranty_end: string;
  warranty_notes: string;
}

/** Every editable field blank, status defaulted — the "first discovery" state. */
export const emptyLifecycle = (
  mac_address: string,
  computer_name = "",
): LifecycleRecord => ({
  mac_address,
  computer_name,
  owner: "",
  location: "",
  status: "Active",
  purchase_date: "",
  purchase_price: "",
  po_number: "",
  vendor: "",
  warranty_provider: "",
  warranty_start: "",
  warranty_end: "",
  warranty_notes: "",
});

/** GET /api/lifecycle/{identifier} — returns {} for an asset seen for the first time. */
export const fetchLifecycle = (identifier: string) =>
  api.get<Partial<LifecycleRecord>>(`/api/lifecycle/${encodeURIComponent(identifier)}`);

/** POST /api/lifecycle — upserts the asset's lifecycle record. */
export const saveLifecycle = (data: LifecycleRecord) =>
  api.post<{ status: string }>("/api/lifecycle", data);
