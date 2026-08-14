import { useMemo } from "react";

import {
  Card,
  DataTable,
  PRIMARY_CELL,
  indexColumn,
  type Column,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type {
  Disk,
  DiskPartition,
  DiskSummary,
  DeviceStorage,
} from "@/types/hardware";

const PARTITION_COLUMNS: Column<DiskPartition>[] = [
  indexColumn(),
  { key: "name", header: "Name", cellClassName: PRIMARY_CELL },
  { key: "totalSize", header: "Total Size" },
  { key: "used", header: "Used" },
  { key: "freeSpace", header: "Free Space" },
  { key: "fileSystem", header: "File System" },
  { key: "bootable", header: "Bootable" },
];

const DISK_COLUMNS: Column<Disk>[] = [
  indexColumn(),
  { key: "name", header: "Name", cellClassName: PRIMARY_CELL },
  { key: "manufacturer", header: "Manufacturer" },
  { key: "model", header: "Model" },
  {
    key: "serialNumber",
    header: "Serial Number",
    wrap: true,
    cellClassName: "max-w-[170px] break-all",
  },
  { key: "interface", header: "Interface" },
  { key: "fileSystem", header: "File System" },
  { key: "size", header: "Size" },
  { key: "used", header: "Used" },
];

/** The six headline figures above the disk table. */
const summaryStats = (
  summary: DiskSummary,
): { label: string; value: string; tone?: string }[] => [
  { label: "Total Storage", value: summary.totalStorage },
  { label: "Used", value: summary.used },
  { label: "Free", value: summary.free, tone: "text-status-online" },
  { label: `SSD (${summary.ssdCount})`, value: summary.ssdSize },
  { label: `HDD (${summary.hddCount})`, value: summary.hddSize },
  { label: "Physical Disks", value: String(summary.physicalDisks) },
];

interface StorageTabProps {
  storage: DeviceStorage;
}

/** Storage tab: disk summary + disk table, then the partition table. */
export const StorageTab = ({ storage }: StorageTabProps) => {
  const stats = useMemo(() => summaryStats(storage.summary), [storage.summary]);

  return (
    <div className="space-y-5">
      <Card className="px-5 pt-5 pb-6">
        <h2 className="text-base font-bold text-heading">Disk Information</h2>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
                {stat.label}
              </dt>
              <dd
                className={cn(
                  "mt-1.5 text-[15px] font-semibold",
                  stat.tone ?? "text-heading",
                )}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <DataTable
          className="mt-5"
          columns={DISK_COLUMNS}
          rows={storage.disks}
          rowKey={(disk) => disk.id}
          bordered
          uppercaseHeaders
          emptyMessage="No physical disks reported for this device."
        />
      </Card>

      <Card className="px-5 pt-5 pb-6">
        <h2 className="text-base font-bold text-heading">Disk Partitions</h2>

        <DataTable
          className="mt-4"
          columns={PARTITION_COLUMNS}
          rows={storage.partitions}
          rowKey={(partition) => partition.id}
          bordered
          uppercaseHeaders
          emptyMessage="No partitions reported for this device."
        />
      </Card>
    </div>
  );
};
