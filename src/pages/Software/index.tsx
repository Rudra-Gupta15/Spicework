import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, HardDrive, Sigma, Trophy } from "lucide-react";

import { CustomizeColumnsModal } from "@/components/common/CustomizeColumnsModal";
import { Navbar } from "@/components/layout/Navbar";
import { SoftwareFilters } from "@/components/software/SoftwareFilters";
import { SoftwareInventoryTable } from "@/components/software/SoftwareInventoryTable";
import { Card, Loader, Pagination, SkeletonTiles, StatCard } from "@/components/ui";
import {
  DEFAULT_SOFTWARE_FILTERS,
  DEFAULT_SOFTWARE_INVENTORY_COLUMNS,
  SOFTWARE_INVENTORY_COLUMNS,
  computeSoftwareKpis,
  filterSoftware,
  isSoftwareFiltered,
  softwareFilterOptions,
  useSoftwareInventory,
} from "@/data/softwareInventory";
import { autoFilterName, createSavedSearch } from "@/data/savedSearches";
import { useViewColumns } from "@/data/viewPreferences";
import { CURRENT_COMPANY } from "@/config/company";
import { ApiError } from "@/lib/api";
import { describeDateRange, isDateRangeActive } from "@/lib/dateRange";
import { exportRows, type ExportColumn, type ExportFormat } from "@/lib/exportRows";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useToast } from "@/hooks/useToast";
import type {
  SoftwareColumnKey,
  SoftwareFilterState,
  SoftwareInventoryItem,
} from "@/types/software";
import type { StatMetric } from "@/types/ui";

const PAGE_SIZE = 10;
const TABLE_ANCHOR_ID = "software-inventory-table";

/** "Publisher: Adobe Inc.", "Installed On: Multiple Devices", … — only the
    dimensions actually narrowed. */
const filterChips = (filters: SoftwareFilterState): string[] => {
  const chips: string[] = [];
  if (filters.search.trim()) chips.push(`Search: ${filters.search.trim()}`);
  if (filters.publisher !== "All") chips.push(`Publisher: ${filters.publisher}`);
  if (filters.installScope !== "All") chips.push(`Installed On: ${filters.installScope}`);
  if (isDateRangeActive(filters.installed))
    chips.push(`Installed: ${describeDateRange(filters.installed)}`);
  return chips;
};

const SoftwarePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { items: allItems, isLoading, error } = useSoftwareInventory();
  const [filters, setFilters] = useState<SoftwareFilterState>(DEFAULT_SOFTWARE_FILTERS);
  const [page, setPage] = useState(1);
  const { columns, save: saveColumns } = useViewColumns<SoftwareColumnKey>(
    "software",
    DEFAULT_SOFTWARE_INVENTORY_COLUMNS,
  );
  const customize = useDisclosure();
  /* A failed save reports through the toast — see `handleSaveFilter`. */
  const [isSaving, setSaving] = useState(false);

  const handleFilterChange = useCallback((patch: Partial<SoftwareFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const publisherOptions = useMemo(() => softwareFilterOptions(allItems).publisher, [allItems]);

  const kpis = useMemo(() => computeSoftwareKpis(allItems), [allItems]);

  /* Software Count drills into the full, unfiltered list right below —
     there's nowhere else to navigate to since this already is that list, so
     clear any filter and scroll to it so the click has a visible effect even
     when nothing was filtered to begin with. */
  const showAllSoftware = useCallback(() => {
    setFilters(DEFAULT_SOFTWARE_FILTERS);
    setPage(1);
    document.getElementById(TABLE_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const kpiTiles = useMemo<StatMetric[]>(
    () => [
      {
        id: "software-count",
        label: "Software Count",
        value: kpis.softwareCount.toLocaleString(),
        icon: Sigma,
        tone: "info",
        onClick: showAllSoftware,
      },
      {
        id: "publisher-count",
        label: "Publisher Count",
        value: kpis.publisherCount.toLocaleString(),
        icon: Building2,
        tone: "brand",
      },
      {
        id: "largest-package",
        label: "Largest Package",
        value: kpis.largest?.size ?? "No data",
        icon: HardDrive,
        tone: "warning",
      },
      {
        id: "top-device",
        label: "Most Applications On",
        value: kpis.topDevice ? kpis.topDevice.count.toLocaleString() : "No data",
        caption: kpis.topDevice ? (kpis.topDevice.name.trim() || "Unknown device") : undefined,
        icon: Trophy,
        tone: "success",
      },
    ],
    [kpis, showAllSoftware],
  );

  const matches = useMemo(() => filterSoftware(allItems, filters), [allItems, filters]);

  const visible = useMemo(
    () => matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [matches, page],
  );

  /* Unfiltered, the list is the full estate. */
  const total = isSoftwareFiltered(filters) ? matches.length : allItems.length;

  /* No dialog — Save Filter persists the current selection immediately and
     jumps straight to where it landed. */
  const handleSaveFilter = useCallback(async () => {
    setSaving(true);
    try {
      const chips = filterChips(filters);
      const name = autoFilterName("Software", chips);

      await createSavedSearch("Software", {
        name,
        scope: "Private",
        filters: chips,
        resultsCount: matches.length,
        createdBy: CURRENT_COMPANY.name,
      });

      /* Raised before the navigation — the toast host lives above the
         router, so it carries over to the Saved Search screen. */
      toast({ tone: "success", title: "Filter saved", description: name });
      navigate("/saved-search", { state: { tab: "Software" } });
    } catch (err) {
      toast({
        tone: "danger",
        title: "Could not save this filter",
        description:
          err instanceof ApiError || err instanceof Error
            ? err.message
            : undefined,
      });
    } finally {
      setSaving(false);
    }
  }, [filters, matches.length, navigate, toast]);

  /* Exports carry the columns the table is currently showing, so a
     customised view exports as it reads. */
  const exportColumns = useMemo<ExportColumn<SoftwareInventoryItem>[]>(
    () =>
      SOFTWARE_INVENTORY_COLUMNS.filter((column) =>
        columns.includes(column.key),
      ).map((column) => ({
        key: column.key,
        label: column.label,
        value: (item) => String(item[column.key] ?? ""),
      })),
    [columns],
  );

  /* Every match, not just the page on screen. */
  const handleExport = useCallback(
    (format: ExportFormat) => {
      const filename = exportRows(
        "software-inventory",
        format,
        exportColumns,
        matches,
      );

      toast({
        tone: "success",
        title: `Exported ${matches.length.toLocaleString()} ${
          matches.length === 1 ? "application" : "applications"
        } as ${format.toUpperCase()}`,
        description: filename,
      });
    },
    [exportColumns, matches, toast],
  );

  return (
    <>
      <Navbar />

      <div className="mt-6 space-y-5">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <SkeletonTiles count={4} className="h-27.5" />
          ) : (
            kpiTiles.map((tile) => <StatCard key={tile.id} metric={tile} />)
          )}
        </section>

        <SoftwareFilters
          filters={filters}
          onChange={handleFilterChange}
          publisherOptions={publisherOptions}
          onSaveFilter={() => void handleSaveFilter()}
          isSavingFilter={isSaving}
          onExport={handleExport}
          matchCount={matches.length}
          onCustomizeView={customize.open}
        />

        <div id={TABLE_ANCHOR_ID}>
          <Card className="p-5">
            <h2 className="text-base font-bold text-heading">
              Software Inventory
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Every distinct application and version installed across your
              estate, aggregated from each device's latest audit.
            </p>

            {error && (
              <p className="mt-3 text-[13px] text-status-offline">{error}</p>
            )}

            <div className="mt-4">
              {isLoading ? (
                <Loader label="Loading software inventory…" />
              ) : (
                <SoftwareInventoryTable
                  items={visible}
                  visibleColumns={columns}
                  onRescanDone={(description) =>
                    toast({ tone: "success", title: "Rescan requested", description })
                  }
                  onRescanError={(description) =>
                    toast({ tone: "danger", title: "Rescan failed", description })
                  }
                />
              )}
            </div>

            <Pagination
              className="mt-5"
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={total}
              itemLabel="applications"
              onPageChange={setPage}
            />
          </Card>
        </div>
      </div>

      <CustomizeColumnsModal
        isOpen={customize.isOpen}
        onClose={customize.close}
        columns={SOFTWARE_INVENTORY_COLUMNS}
        defaultColumns={DEFAULT_SOFTWARE_INVENTORY_COLUMNS}
        value={columns}
        onApply={saveColumns}
      />
    </>
  );
};

export default SoftwarePage;
