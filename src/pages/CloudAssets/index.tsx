import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CloudAssetsTable } from "@/components/cloud/CloudAssetsTable";
import { CloudFilters } from "@/components/cloud/CloudFilters";
import { Navbar } from "@/components/layout/Navbar";
import { Card, Pagination, StatCard } from "@/components/ui";
import {
  CLOUD_SERVICES,
  CLOUD_STATS,
  DEFAULT_CLOUD_FILTERS,
  TOTAL_CLOUD_SERVICES,
  filterServices,
  isFiltered,
} from "@/data/cloudAssets";
import type { CloudFilterState, CloudService } from "@/types/cloud";

const PAGE_SIZE = 6;

const CloudAssetsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CloudFilterState>(
    DEFAULT_CLOUD_FILTERS,
  );
  const [page, setPage] = useState(1);

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

  return (
    <>
      <Navbar
        title="Cloud Assets Overview"
        subtitle="Manage and optimize subscriptions, compute platforms, and license compliance rules."
      />

      <div className="mt-6 space-y-5">
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CLOUD_STATS.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </section>

        <CloudFilters filters={filters} onChange={handleFilterChange} />

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
