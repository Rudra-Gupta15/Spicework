import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge, Checkbox, Input } from "@/components/ui";
import { HARDWARE_DEVICES } from "@/data/hardware";
import { cn } from "@/lib/cn";
import type { HardwareDevice } from "@/types/hardware";

/** How many rows the picker lists at once before the search has to narrow it. */
const VISIBLE_LIMIT = 200;

const STATUS_TONE = {
  ONLINE: "success",
  OFFLINE: "danger",
  MAINTENANCE: "warning",
} as const;

interface AssetSelectStepProps {
  /** Serial numbers, lower-cased — the same key the file is matched on. */
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

/**
 * The step before the file: which assets this upload is about.
 *
 * Ticking nothing is a real answer — the file then stands on its own and is
 * matched by serial number, which is how a create run has to work. Ticking a
 * few narrows an update to them, so a spreadsheet with the whole estate on it
 * can be used to change the five machines that actually moved.
 */
export const AssetSelectStep = ({ selected, onChange }: AssetSelectStepProps) => {
  const [search, setSearch] = useState("");

  const devices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term === "") return HARDWARE_DEVICES;

    return HARDWARE_DEVICES.filter((device) =>
      `${device.name} ${device.serialNumber} ${device.type} ${device.location} ${device.assignedTo}`
        .toLowerCase()
        .includes(term),
    );
  }, [search]);

  const visible = devices.slice(0, VISIBLE_LIMIT);
  const key = (device: HardwareDevice) => device.serialNumber.toLowerCase();

  const allShown =
    visible.length > 0 && visible.every((device) => selected.has(key(device)));

  const toggle = (device: HardwareDevice, checked: boolean) => {
    const next = new Set(selected);

    if (checked) next.add(key(device));
    else next.delete(key(device));

    onChange(next);
  };

  const toggleAll = (checked: boolean) => {
    const next = new Set(selected);

    visible.forEach((device) => {
      if (checked) next.add(key(device));
      else next.delete(key(device));
    });

    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-muted">
        Tick the assets this upload is about, or leave them all clear and let
        the file be matched on serial number instead.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          size="md"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, serial, type or site..."
          aria-label="Search assets"
          leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
          containerClassName="min-w-[220px] flex-1"
        />

        <span className="text-[13px] font-semibold text-heading">
          {selected.size === 0
            ? "Nothing selected"
            : `${selected.size} selected`}
        </span>

        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className="rounded px-1 text-[13px] font-semibold text-auth-panel transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-auth-panel/25 focus-visible:outline-none"
          >
            Clear
          </button>
        )}
      </div>

      <div className="scrollbar-slim-light max-h-80 overflow-y-auto rounded-lg border border-line">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-canvas px-3 py-2">
          <Checkbox
            checked={allShown}
            onChange={toggleAll}
            label={allShown ? "Clear all shown" : "Select all shown"}
            className="text-[13px] font-semibold text-heading"
          />
        </div>

        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-muted">
            No assets match that search.
          </p>
        ) : (
          <ul>
            {visible.map((device) => {
              const checked = selected.has(key(device));

              return (
                <li
                  key={device.id}
                  className={cn(
                    "flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-3 py-2 last:border-b-0",
                    checked && "bg-brand-50",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onChange={(value) => toggle(device, value)}
                    label=""
                  />

                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate text-[13px] font-semibold text-heading">
                      {device.name}
                    </p>
                    <p className="truncate text-[11px] text-muted">
                      {device.serialNumber} · {device.type} · {device.location}
                    </p>
                  </div>

                  <Badge tone={STATUS_TONE[device.status]}>
                    {device.status}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {devices.length > VISIBLE_LIMIT && (
        <p className="text-[11px] text-muted">
          Showing the first {VISIBLE_LIMIT} of {devices.length} assets — search
          to narrow the list.
        </p>
      )}
    </div>
  );
};
