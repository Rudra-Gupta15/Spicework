import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Monitor, WifiOff, Wifi } from "lucide-react";

import { CustomizeColumnsModal } from "@/components/common/CustomizeColumnsModal";
import { HardwareFilters } from "@/components/hardware/HardwareFilters";
import { HardwareTable } from "@/components/hardware/HardwareTable";
import { Navbar } from "@/components/layout/Navbar";
import { Card, Loader, Pagination, SkeletonTiles, StatCard } from "@/components/ui";
import {
  DEFAULT_COLUMNS,
  DEFAULT_FILTERS,
  HARDWARE_COLUMNS,
  filterDevices,
  hardwareFilterOptions,
  isFiltered,
} from "@/data/hardware";
import { computeHardwareKpis, useAllAssetMetadata, useDeviceList } from "@/data/deviceApi";
import { autoFilterName, createSavedSearch } from "@/data/savedSearches";
import { useViewColumns } from "@/data/viewPreferences";
import { CURRENT_COMPANY } from "@/config/company";
import { ApiError } from "@/lib/api";
import { useDisclosure } from "@/hooks/useDisclosure";
import type {
  HardwareColumnKey,
  HardwareDevice,
  HardwareFilterState,
} from "@/types/hardware";
import type { StatMetric } from "@/types/ui";

const PAGE_SIZE = 6;
const TABLE_ANCHOR_ID = "hardware-inventory-table";

/** "Type: Laptop", "Status: ONLINE", … — only the dimensions actually narrowed. */
const filterChips = (filters: HardwareFilterState): string[] => {
  const chips: string[] = [];
  if (filters.search.trim()) chips.push(`Search: ${filters.search.trim()}`);
  if (filters.type !== "All") chips.push(`Type: ${filters.type}`);
  if (filters.status !== "All") chips.push(`Status: ${filters.status}`);
  if (filters.manufacturer !== "All") chips.push(`Manufacturer: ${filters.manufacturer}`);
  return chips;
};

const HardwarePage = () => {
  const navigate = useNavigate();
  const { devices: allDevices, isLoading, error } = useDeviceList();
  const { assets, isLoading: assetsLoading } = useAllAssetMetadata();
  const [filters, setFilters] = useState<HardwareFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const { columns, save: saveColumns } = useViewColumns<HardwareColumnKey>("hardware", DEFAULT_COLUMNS);
  const customize = useDisclosure();
  const [saveError, setSaveError] = useState<string>();
  const [isSaving, setSaving] = useState(false);

  const handleFilterChange = useCallback(
    (patch: Partial<HardwareFilterState>) => {
      setFilters((current) => ({ ...current, ...patch }));
      setPage(1);
    },
    [],
  );

  const openDevice = useCallback(
    (device: HardwareDevice) => navigate(`/inventory/hardware/${device.id}`),
    [navigate],
  );

  const devices = useMemo(
    () => filterDevices(allDevices, filters),
    [allDevices, filters],
  );

  /* Dropdown choices come from the devices actually loaded, so every option
     matches something in the table (the mock list didn't). */
  const filterOptions = useMemo(
    () => hardwareFilterOptions(allDevices),
    [allDevices],
  );

  const visible = useMemo(
    () => devices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [devices, page],
  );

  /* Unfiltered, the list is one page of the full estate. */
  const total = isFiltered(filters) ? devices.length : allDevices.length;

  const kpis = useMemo(() => computeHardwareKpis(allDevices, assets), [allDevices, assets]);
  const kpisLoading = isLoading || assetsLoading;

  /* Total Devices drills into the full, unfiltered list right below — there's
     nowhere else to navigate to since this already is that list, so clear
     any filter and scroll to it so the click has a visible effect even when
     nothing was filtered to begin with. */
  const showAllDevices = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    document.getElementById(TABLE_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const kpiTiles = useMemo<StatMetric[]>(
    () => [
      {
        id: "total-devices",
        label: "Total Devices",
        value: kpis.total.toLocaleString(),
        icon: Monitor,
        tone: "brand",
        onClick: showAllDevices,
      },
      {
        id: "online",
        label: "Online",
        value: kpis.online.toLocaleString(),
        icon: Wifi,
        tone: "success",
      },
      {
        id: "offline",
        label: "Offline",
        value: kpis.offline.toLocaleString(),
        icon: WifiOff,
        tone: "neutral",
      },
      {
        id: "warranty-expiring",
        label: "Warranty Expiring",
        value: kpis.warrantyExpiring.toLocaleString(),
        icon: AlertTriangle,
        tone: "warning",
      },
    ],
    [kpis, showAllDevices],
  );

  /* No dialog — Save Filter persists the current selection immediately and
     jumps straight to where it landed. */
  const handleSaveFilter = useCallback(async () => {
    setSaveError(undefined);
    setSaving(true);
    try {
      const chips = filterChips(filters);
      await createSavedSearch("Hardware", {
        name: autoFilterName("Hardware", chips),
        scope: "Private",
        filters: chips,
        resultsCount: devices.length,
        createdBy: CURRENT_COMPANY.name,
      });
      navigate("/saved-search", { state: { tab: "Hardware" } });
    } catch (err) {
      setSaveError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not save this filter.",
      );
    } finally {
      setSaving(false);
    }
  }, [filters, devices.length, navigate]);

  return (
    <>
      <Navbar />

      <div className="mt-6 space-y-5">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpisLoading ? (
            <SkeletonTiles count={4} className="h-27.5" />
          ) : (
            kpiTiles.map((tile) => <StatCard key={tile.id} metric={tile} />)
          )}
        </section>

        <HardwareFilters
          filters={filters}
          onChange={handleFilterChange}
          options={filterOptions}
          onSaveFilter={() => void handleSaveFilter()}
          isSavingFilter={isSaving}
          onCustomizeView={customize.open}
        />

        {saveError && (
          <p className="text-[13px] text-status-offline">{saveError}</p>
        )}

        <div id={TABLE_ANCHOR_ID}>
          <Card className="p-5">
            <h2 className="text-base font-bold text-heading">
              Hardware Inventory
            </h2>

            {error && (
              <p className="mt-2 text-[13px] text-status-offline">{error}</p>
            )}

            <div className="mt-4">
              {isLoading ? (
                <Loader label="Loading device inventory…" />
              ) : (
                <HardwareTable
                  devices={visible}
                  visibleColumns={columns}
                  onSelect={openDevice}
                />
              )}
            </div>

            <Pagination
              className="mt-5"
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={total}
              itemLabel="devices"
              onPageChange={setPage}
            />
          </Card>
        </div>
      </div>

      <CustomizeColumnsModal
        isOpen={customize.isOpen}
        onClose={customize.close}
        columns={HARDWARE_COLUMNS}
        defaultColumns={DEFAULT_COLUMNS}
        value={columns}
        onApply={saveColumns}
      />
    </>
  );
};

export default HardwarePage;
