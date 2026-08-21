import { ManualBadge } from "@/components/common/ManualBadge";
import {
  Card,
  DataTable,
  PRIMARY_CELL,
  sequenceColumn,
  type Column,
} from "@/components/ui";
import type { VideoController } from "@/types/hardware";

const VIDEO_COLUMNS: Column<VideoController>[] = [
  sequenceColumn(),
  {
    key: "name",
    header: "Device Name",
    wrap: true,
    cellClassName: `max-w-[220px] ${PRIMARY_CELL}`,
    render: (controller) => (
      <span className="inline-flex items-center">
        {controller.name}
        {controller.manuallyCorrected && <ManualBadge />}
      </span>
    ),
  },
  {
    key: "adapterName",
    header: "Adapter Name",
    wrap: true,
    cellClassName: "max-w-[220px]",
  },
  {
    key: "videoProcessor",
    header: "Video Processor",
    wrap: true,
    cellClassName: "max-w-[240px]",
  },
  { key: "driverVersion", header: "Driver Version" },
];

interface VideoTabProps {
  controllers: VideoController[];
}

/** Video/GPU tab: one row per video controller the scan reported. */
export const VideoTab = ({ controllers }: VideoTabProps) => (
  <Card className="px-5 pt-5 pb-6">
    <h2 className="text-base font-bold text-heading">Video Controllers / GPU</h2>

    <DataTable
      className="mt-4"
      columns={VIDEO_COLUMNS}
      rows={controllers}
      rowKey={(controller) => controller.id}
      bordered
      uppercaseHeaders
      emptyMessage="No video controllers reported for this device."
    />
  </Card>
);
