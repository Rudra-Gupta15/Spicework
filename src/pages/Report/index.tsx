import { useCallback, useEffect, useMemo, useState } from "react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { Navbar } from "@/components/layout/Navbar";
import { ReportFilters } from "@/components/report/ReportFilters";
import { ReportPreviewPanel } from "@/components/report/ReportPreviewPanel";
import { ReportSystemTable } from "@/components/report/ReportSystemTable";
import { Card, Loader, Pagination } from "@/components/ui";
import { useDeviceList } from "@/data/deviceApi";
import {
  DEFAULT_REPORT_FILTERS,
  REPORT_CATEGORIES,
  buildReport,
  fetchRecordCounts,
  filterReportSystems,
  isReportFiltered,
  reportFilterOptions,
  reportScope,
  reportSystems,
  setReportScope,
} from "@/data/report";
import { ApiError } from "@/lib/api";
import { downloadReport } from "@/lib/reportExport";
import type { HardwareDevice } from "@/types/hardware";
import type {
  ReportCategory,
  ReportFilterState,
  ReportFormat,
  ReportPreview,
  ReportScope,
  ReportSystem,
} from "@/types/report";

const PAGE_SIZE = 5;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

/**
 * Reports are picked in three steps: choose Hardware or Software, pick the
 * system from the list that opens, then preview the generated report and
 * download it as a PDF or an Excel workbook.
 */
const ReportPage = () => {
  const { devices: allDevices, isLoading: devicesLoading, error: devicesError } = useDeviceList();

  const [category, setCategory] = useState<ReportCategory>("Hardware");
  const [selectedDevice, setSelectedDevice] = useState<HardwareDevice | null>(null);
  const [filters, setFilters] = useState<ReportFilterState>(DEFAULT_REPORT_FILTERS);
  const [page, setPage] = useState(1);
  /* Bumped whenever a report is made Public or Private, so the list behind
     the preview is rebuilt with the new scope on it. */
  const [scopeVersion, setScopeVersion] = useState(0);

  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [report, setReport] = useState<ReportPreview | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string>();

  /* Switching tab re-runs the whole flow from its first step. */
  const handleCategoryChange = useCallback((next: ReportCategory) => {
    setCategory(next);
    setSelectedDevice(null);
    setFilters(DEFAULT_REPORT_FILTERS);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((patch: Partial<ReportFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_REPORT_FILTERS);
    setPage(1);
  }, []);

  const systems = useMemo(
    () => reportSystems(allDevices),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scopeVersion is the signal that a scope changed
    [allDevices, scopeVersion],
  );

  const changeScope = useCallback(
    (scope: ReportScope) => {
      if (!selectedDevice) return;

      setReportScope(selectedDevice.id, scope);
      setScopeVersion((version) => version + 1);
    },
    [selectedDevice],
  );

  const matches = useMemo(
    () => filterReportSystems(systems, filters),
    [systems, filters],
  );

  /* Options come from every loaded system rather than the narrowed list, so
     picking one dimension never empties the others. */
  const filterOptions = useMemo(() => reportFilterOptions(systems), [systems]);

  /* Clamping beats resetting: narrowing the filters can never strand the
     view on a page that no longer exists. */
  const lastPage = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);

  const visible = useMemo(
    () => matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [matches, currentPage],
  );

  /* Record counts require a full detail fetch per device — only ever run
     for the handful of rows the current page actually shows. */
  useEffect(() => {
    if (visible.length === 0) return;
    let cancelled = false;

    const visibleDevices = visible
      .map((system) => allDevices.find((device) => device.id === system.id))
      .filter((device): device is HardwareDevice => Boolean(device));

    fetchRecordCounts(visibleDevices, category).then((counts) => {
      if (!cancelled) setRecordCounts((current) => ({ ...current, ...counts }));
    });

    return () => {
      cancelled = true;
    };
  }, [visible, allDevices, category]);

  const visibleWithCounts: ReportSystem[] = useMemo(
    () => visible.map((system) => ({ ...system, records: recordCounts[system.id] ?? system.records })),
    [visible, recordCounts],
  );

  const openReport = useCallback(
    (system: ReportSystem) => {
      const device = allDevices.find((item) => item.id === system.id);
      if (device) setSelectedDevice(device);
    },
    [allDevices],
  );

  useEffect(() => {
    // Nothing to build without a selected device — and the panel that would
    // show `report` is only rendered while one is selected anyway, so there's
    // no need to clear it here.
    if (!selectedDevice) return;

    let cancelled = false;
    // Resetting for a fresh fetch on re-selection, not a render-time update —
    // the rule can't tell the two apart.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReportError(undefined);
    setReportLoading(true);
    buildReport(category, selectedDevice)
      .then((result) => {
        if (!cancelled) setReport(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) setReportError(errorMessage(error, "Could not generate this report."));
      })
      .finally(() => {
        if (!cancelled) setReportLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, selectedDevice]);

  const handleDownload = useCallback(
    (format: ReportFormat) => {
      if (report) downloadReport(report, format);
    },
    [report],
  );

  return (
    <>
      <Navbar />

      <DetailTabs
        tabs={REPORT_CATEGORIES}
        active={category}
        onChange={handleCategoryChange}
        className="mt-6"
      />

      {selectedDevice ? (
        <div className="mt-5">
          {reportError && (
            <Card className="p-8 text-center">
              <p className="text-sm text-status-offline">{reportError}</p>
            </Card>
          )}
          {!reportError && (reportLoading || !report) && (
            <Card className="p-8">
              <Loader label="Generating report…" />
            </Card>
          )}
          {!reportError && !reportLoading && report && (
            <ReportPreviewPanel
              report={report}
              scope={reportScope(selectedDevice.id)}
              onScopeChange={changeScope}
              onBack={() => setSelectedDevice(null)}
              onDownload={handleDownload}
            />
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-heading">
                  {category} Reports
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Select a system to preview its {category.toLowerCase()} report,
                  then download it as PDF or Excel.
                </p>
              </div>

              <p className="text-[13px] text-muted tabular-nums">
                {matches.length} of {systems.length}{" "}
                {systems.length === 1 ? "system" : "systems"}
              </p>
            </div>

            <div className="mt-4">
              <ReportFilters
                category={category}
                filters={filters}
                onChange={handleFilterChange}
                options={filterOptions}
                isFiltered={isReportFiltered(filters)}
                onClear={clearFilters}
              />
            </div>

            {devicesError && (
              <p className="mt-3 text-[13px] text-status-offline">{devicesError}</p>
            )}

            <div className="mt-4">
              {devicesLoading ? (
                <Loader label="Loading device inventory…" />
              ) : (
                <ReportSystemTable
                  systems={visibleWithCounts}
                  category={category}
                  onSelect={openReport}
                />
              )}
            </div>

            <Pagination
              className="mt-5"
              page={currentPage}
              pageSize={PAGE_SIZE}
              totalItems={matches.length}
              itemLabel="systems"
              onPageChange={setPage}
            />
          </Card>
        </div>
      )}
    </>
  );
};

export default ReportPage;
