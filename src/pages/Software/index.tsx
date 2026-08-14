import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CustomizeColumnsModal } from "@/components/common/CustomizeColumnsModal";
import { HardwareFilters } from "@/components/hardware/HardwareFilters";
import { HardwareTable } from "@/components/hardware/HardwareTable";
import { Navbar } from "@/components/layout/Navbar";
import { Card, Pagination } from "@/components/ui";
import {
  DEFAULT_COLUMNS,
  DEFAULT_FILTERS,
  HARDWARE_DEVICES,
  filterDevices,
  isFiltered,
} from "@/data/hardware";
import {
  DEFAULT_SOFTWARE_COLUMNS,
  SOFTWARE_COLUMNS,
  TOTAL_SOFTWARE_DEVICES,
  type SoftwareColumnKey,
} from "@/data/software";
import { useDisclosure } from "@/hooks/useDisclosure";
import type {
  HardwareColumnKey,
  HardwareDevice,
  HardwareFilterState,
} from "@/types/hardware";

const PAGE_SIZE = 5;

const SoftwarePage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<HardwareFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [columns] = useState<HardwareColumnKey[]>(DEFAULT_COLUMNS);
  /* Picker selection — the software column set from the design. */
  const [softwareColumns, setSoftwareColumns] = useState<SoftwareColumnKey[]>(
    DEFAULT_SOFTWARE_COLUMNS,
  );
  const customize = useDisclosure();

  const handleFilterChange = useCallback(
    (patch: Partial<HardwareFilterState>) => {
      setFilters((current) => ({ ...current, ...patch }));
      setPage(1);
    },
    [],
  );

  const openDevice = useCallback(
    (device: HardwareDevice) => navigate(`/inventory/software/${device.id}`),
    [navigate],
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
  const total = isFiltered(filters) ? devices.length : TOTAL_SOFTWARE_DEVICES;

  return (
    <>
      {/* No override — the navigation config already describes this page.
          It used to carry the Hardware page's subtitle verbatim. */}
      <Navbar />

      <div className="mt-6 space-y-5">
        <HardwareFilters
          filters={filters}
          onChange={handleFilterChange}
          onCustomizeView={customize.open}
        />

        <Card className="p-5">
          <HardwareTable
            devices={visible}
            visibleColumns={columns}
            onSelect={openDevice}
          />

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

      <CustomizeColumnsModal
        isOpen={customize.isOpen}
        onClose={customize.close}
        columns={SOFTWARE_COLUMNS}
        defaultColumns={DEFAULT_SOFTWARE_COLUMNS}
        value={softwareColumns}
        onApply={setSoftwareColumns}
      />
    </>
  );
};

export default SoftwarePage;
