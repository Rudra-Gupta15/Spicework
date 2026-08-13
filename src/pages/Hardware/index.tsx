import { useCallback, useMemo, useState } from "react";

import { HardwareFilters } from "@/components/hardware/HardwareFilters";
import { HardwareTable } from "@/components/hardware/HardwareTable";
import { Navbar } from "@/components/layout/Navbar";
import { Card, Pagination, StatCard } from "@/components/ui";
import {
  DEFAULT_FILTERS,
  HARDWARE_DEVICES,
  HARDWARE_STATS,
  TOTAL_DEVICES,
  filterDevices,
  isFiltered,
} from "@/data/hardware";
import type { HardwareFilterState } from "@/types/hardware";

const PAGE_SIZE = 6;

const HardwarePage = () => {
  const [filters, setFilters] = useState<HardwareFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const handleFilterChange = useCallback(
    (patch: Partial<HardwareFilterState>) => {
      setFilters((current) => ({ ...current, ...patch }));
      setPage(1);
    },
    [],
  );

  const devices = useMemo(
    () => filterDevices(HARDWARE_DEVICES, filters),
    [filters],
  );

  const visible = useMemo(
    () => devices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [devices, page],
  );

  /* Unfiltered, the list is one page of the full estate. */
  const total = isFiltered(filters) ? devices.length : TOTAL_DEVICES;

  return (
    <>
      <Navbar />

      <div className="mt-6 space-y-5">
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HARDWARE_STATS.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </section>

        <HardwareFilters filters={filters} onChange={handleFilterChange} />

        <Card className="p-5">
          <h2 className="text-base font-bold text-heading">
            Hardware Inventory
          </h2>

          <div className="mt-4">
            <HardwareTable devices={visible} />
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
    </>
  );
};

export default HardwarePage;
