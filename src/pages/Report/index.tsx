import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { DetailTabs } from "@/components/common/DetailTabs";
import { Navbar } from "@/components/layout/Navbar";
import { ReportPreviewPanel } from "@/components/report/ReportPreviewPanel";
import { ReportSystemTable } from "@/components/report/ReportSystemTable";
import { Card, Input, Pagination } from "@/components/ui";
import { REPORT_CATEGORIES, buildReport, reportSystems } from "@/data/report";
import { downloadReport } from "@/lib/reportExport";
import type { ReportCategory, ReportFormat, ReportSystem } from "@/types/report";

const PAGE_SIZE = 5;

/**
 * Reports are picked in three steps: choose Hardware or Software, pick the
 * system from the list that opens, then preview the generated report and
 * download it as a PDF or an Excel workbook.
 */
const ReportPage = () => {
  const [category, setCategory] = useState<ReportCategory>("Hardware");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* Switching tab re-runs the whole flow from its first step. */
  const handleCategoryChange = useCallback((next: ReportCategory) => {
    setCategory(next);
    setSelectedId(null);
    setSearch("");
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const systems = useMemo(() => reportSystems(category), [category]);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term === "") return systems;

    return systems.filter((system) =>
      `${system.name} ${system.type} ${system.manufacturer} ${system.serialNumber} ${system.assignedTo}`
        .toLowerCase()
        .includes(term),
    );
  }, [systems, search]);

  const visible = useMemo(
    () => matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [matches, page],
  );

  const report = useMemo(
    () => (selectedId ? buildReport(category, selectedId) : null),
    [category, selectedId],
  );

  const openReport = useCallback(
    (system: ReportSystem) => setSelectedId(system.id),
    [],
  );

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

      {report ? (
        <div className="mt-5">
          <ReportPreviewPanel
            report={report}
            onBack={() => setSelectedId(null)}
            onDownload={handleDownload}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-heading">
                  {category} Reports
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Select a system to preview its {category.toLowerCase()} report,
                  then download it as PDF or Excel.
                </p>
              </div>

              <Input
                type="search"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder={`Search ${category.toLowerCase()} systems...`}
                aria-label={`Search ${category.toLowerCase()} systems`}
                leading={<Search className="h-4 w-4" strokeWidth={1.9} />}
                size="sm"
                containerClassName="w-full sm:w-auto sm:min-w-[240px]"
              />
            </div>

            <div className="mt-4">
              <ReportSystemTable
                systems={visible}
                category={category}
                onSelect={openReport}
              />
            </div>

            <Pagination
              className="mt-5"
              page={page}
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
