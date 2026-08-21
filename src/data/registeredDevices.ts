import { useCallback, useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import type {
  DeviceAssignment,
  DeviceDraft,
  DeviceRecord,
} from "@/types/device";

/* ── Registered devices — the real estate, from Postgres ──────────────────
   backend/routers/registered_devices.py. Every call is scoped to the caller's
   own organization on the server, from their token, so there is no tenant id
   to pass (or to get wrong) from here. */

/** The wire shape. snake_case, dates as `YYYY-MM-DD`. */
interface DeviceDto {
  id: string;
  organization_id: string;
  site_id: string | null;
  category: DeviceRecord["category"];
  name: string;
  serial_number: string;
  buy_date: string | null;
  current_user_name: string;
  created_at: string;
  updated_at: string;
}

interface AssignmentDto {
  id: string;
  user_name: string;
  assigned_on: string;
  returned_on: string | null;
  note: string | null;
  created_at: string;
}

/* The screen's types stay camelCase and stay unaware of the wire format, so
   the table and modals did not have to change when this page moved off its
   seed data. */
const toDevice = (dto: DeviceDto): DeviceRecord => ({
  id: dto.id,
  category: dto.category,
  name: dto.name,
  serialNumber: dto.serial_number,
  buyDate: dto.buy_date ?? "",
  currentUser: dto.current_user_name,
});

const toAssignment = (dto: AssignmentDto): DeviceAssignment => ({
  id: dto.id,
  user: dto.user_name,
  assignedOn: dto.assigned_on,
  returnedOn: dto.returned_on ?? undefined,
  note: dto.note ?? undefined,
});

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

export const fetchDevices = async (): Promise<DeviceRecord[]> => {
  const data = await api.get<{ devices: DeviceDto[] }>("/api/registered-devices");
  return (data.devices ?? []).map(toDevice);
};

export const createDevice = async (draft: DeviceDraft): Promise<DeviceRecord> => {
  const dto = await api.post<DeviceDto>("/api/registered-devices", {
    category: draft.category,
    name: draft.name,
    serial_number: draft.serialNumber,
    /* The column is a real DATE, so an unfilled field has to go as null
       rather than as the empty string the form holds. */
    buy_date: draft.buyDate || null,
    current_user: draft.currentUser || null,
  });
  return toDevice(dto);
};

/**
 * Rename, re-serial, re-categorize or re-date an already-registered unit.
 * Who holds it stays out of this — that's `assignDevice`/`returnDevice`, so
 * the hand-off trail can never be silently overwritten by an edit.
 */
export const updateDevice = async (
  id: string,
  draft: Omit<DeviceDraft, "currentUser">,
): Promise<DeviceRecord> => {
  const dto = await api.patch<DeviceDto>(
    `/api/registered-devices/${encodeURIComponent(id)}`,
    {
      category: draft.category,
      name: draft.name,
      serial_number: draft.serialNumber,
      buy_date: draft.buyDate || null,
    },
  );
  return toDevice(dto);
};

export const fetchAssignments = async (
  deviceId: string,
): Promise<DeviceAssignment[]> => {
  const data = await api.get<{ assignments: AssignmentDto[] }>(
    `/api/registered-devices/${encodeURIComponent(deviceId)}/assignments`,
  );
  return (data.assignments ?? []).map(toAssignment);
};

/** Hand a unit to someone, closing whoever holds it now. */
export const assignDevice = async (
  deviceId: string,
  userName: string,
  note?: string,
): Promise<DeviceAssignment[]> => {
  const data = await api.post<{ assignments: AssignmentDto[] }>(
    `/api/registered-devices/${encodeURIComponent(deviceId)}/assignments`,
    { user_name: userName, note: note || null },
  );
  return (data.assignments ?? []).map(toAssignment);
};

interface DeviceEstate {
  devices: DeviceRecord[];
  isLoading: boolean;
  error?: string;
  /** Registers a unit and folds it into the list. Throws so the dialog can
      keep itself open and show why the save failed. */
  addDevice: (draft: DeviceDraft) => Promise<DeviceRecord>;
  /** Saves changes to an already-registered unit in place. Same throw-to-keep-
      open contract as `addDevice`. */
  editDevice: (id: string, draft: Omit<DeviceDraft, "currentUser">) => Promise<DeviceRecord>;
  reload: () => void;
}

/** The organization's whole estate. One fetch backs every tab — the list is
    small, and holding it whole keeps switching tabs instant. */
export const useRegisteredDevices = (): DeviceEstate => {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    /* `isLoading` starts true and is raised again by `reload`, so the effect
       only ever lowers it. Setting it here instead would be a synchronous
       setState inside an effect — an extra render pass for no gain. */
    fetchDevices()
      .then((data) => {
        if (cancelled) return;
        setDevices(data);
        setError(undefined);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, "Could not load devices."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const addDevice = useCallback(async (draft: DeviceDraft) => {
    const device = await createDevice(draft);
    /* Straight onto the front of the list rather than refetching: the server
       returns the saved row, and the list is ordered newest first anyway. */
    setDevices((current) => [device, ...current]);
    return device;
  }, []);

  const editDevice = useCallback(
    async (id: string, draft: Omit<DeviceDraft, "currentUser">) => {
      const device = await updateDevice(id, draft);
      /* In place rather than a refetch: the server returns the saved row,
         and nothing about its position in the (newest-first) order changed
         by editing it. */
      setDevices((current) =>
        current.map((existing) => (existing.id === id ? device : existing)),
      );
      return device;
    },
    [],
  );

  const reload = useCallback(() => {
    setLoading(true);
    setReloadToken((n) => n + 1);
  }, []);

  return { devices, isLoading, error, addDevice, editDevice, reload };
};
