import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CloudAssetsTable } from "@/components/cloud/CloudAssetsTable";
import { CloudFilters } from "@/components/cloud/CloudFilters";
import { Navbar } from "@/components/layout/Navbar";
import { Card, Pagination } from "@/components/ui";
import {
  CLOUD_SERVICES,
  DEFAULT_CLOUD_FILTERS,
  TOTAL_CLOUD_SERVICES,
  filterServices,
  isFiltered,
} from "@/data/cloudAssets";
import { autoFilterName, createSavedSearch } from "@/data/savedSearches";
import { CURRENT_COMPANY } from "@/config/company";
import { ApiError } from "@/lib/api";
import { exportRows, type ExportColumn, type ExportFormat } from "@/lib/exportRows";
import { useToast } from "@/hooks/useToast";
import type { CloudFilterState, CloudService } from "@/types/cloud";

const PAGE_SIZE = 6;

/* No "Customize View" here, so the export is simply every column the cloud
   table has. */
const EXPORT_COLUMNS: ExportColumn<CloudService>[] = [
  { key: "name", label: "Service", value: (service) => service.name },
  { key: "provider", label: "Provider", value: (service) => service.provider },
  { key: "category", label: "Category", value: (service) => service.category },
  { key: "status", label: "Status", value: (service) => service.status },
  { key: "users", label: "Users", value: (service) => String(service.users) },
  { key: "monthlyCost", label: "Monthly Cost", value: (service) => service.monthlyCost },
  { key: "renewalDate", label: "Renewal Date", value: (service) => service.renewalDate },
];

/** "Category: SaaS", "Status: Active", … — only the dimensions actually narrowed. */
const filterChips = (filters: CloudFilterState): string[] => {
  const chips: string[] = [];
  if (filters.search.trim()) chips.push(`Search: ${filters.search.trim()}`);
  if (filters.category !== "All") chips.push(`Category: ${filters.category}`);
  if (filters.status !== "All") chips.push(`Status: ${filters.status}`);
  if (filters.provider !== "All") chips.push(`Provider: ${filters.provider}`);
  return chips;
};

const CloudAssetsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, setFilters] = useState<CloudFilterState>(
    DEFAULT_CLOUD_FILTERS,
  );
  const [page, setPage] = useState(1);
  /* A failed save reports through the toast — see `handleSaveFilter`. */
  const [isSaving, setSaving] = useState(false);

  const handleFilterChange = useCallback(
    (patch: Partial<CloudFilterState>) => {
      setFilters((current) => ({ ...current, ...patch }));
      setPage(1);
    },
    [],
  );

  const openService = useCallback(
    (service: CloudService) =>
      navigate(`/inventory/cloud-assets/${service.id}`),
    [navigate],
  );

  const services = useMemo(
    () => filterServices(CLOUD_SERVICES, filters),
    [filters],
  );

  const visible = useMemo(
    () => services.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [services, page],
  );

  /* Unfiltered, the list is one page of the full estate. */
  const total = isFiltered(filters) ? services.length : TOTAL_CLOUD_SERVICES;

  /* No dialog — Save Filter persists the current selection immediately and
     jumps straight to where it landed, the same as Hardware and Software. */
  const handleSaveFilter = useCallback(async () => {
    setSaving(true);
    try {
      const chips = filterChips(filters);
      const name = autoFilterName("Cloud Assets", chips);

      await createSavedSearch("Cloud Assets", {
        name,
        scope: "Private",
        filters: chips,
        resultsCount: services.length,
        createdBy: CURRENT_COMPANY.name,
      });

      /* Raised before the navigation — the toast host lives above the
         router, so it carries over to the Saved Search screen. */
      toast({ tone: "success", title: "Filter saved", description: name });
      navigate("/saved-search", { state: { tab: "Cloud Assets" } });
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
  }, [filters, services.length, navigate, toast]);

  /* Every match, not just the page on screen. */
  const handleExport = useCallback(
    (format: ExportFormat) => {
      const filename = exportRows(
        "cloud-assets",
        format,
        EXPORT_COLUMNS,
        services,
      );

      toast({
        tone: "success",
        title: `Exported ${services.length.toLocaleString()} ${
          services.length === 1 ? "service" : "services"
        } as ${format.toUpperCase()}`,
        description: filename,
      });
    },
    [services, toast],
  );

  return (
    <>
      <Navbar
        title="Cloud Assets Overview"
        subtitle="Manage and optimize subscriptions, compute platforms, and license compliance rules."
      />

      <div className="mt-6 space-y-5">
        <CloudFilters
          filters={filters}
          onChange={handleFilterChange}
          onSaveFilter={() => void handleSaveFilter()}
          isSavingFilter={isSaving}
          onExport={handleExport}
          matchCount={services.length}
        />

        <Card className="p-5">
          <CloudAssetsTable
            services={visible}
            onSelect={openService}
            onMore={openService}
          />

          <Pagination
            className="mt-5"
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={total}
            itemLabel="cloud systems"
            onPageChange={setPage}
          />
        </Card>
      </div>
    </>
  );
};

export default CloudAssetsPage;
