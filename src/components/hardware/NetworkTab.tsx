import { ManualBadge } from "@/components/common/ManualBadge";
import {
  Card,
  DataTable,
  PRIMARY_CELL,
  indexColumn,
  type Column,
} from "@/components/ui";
import type { NetworkAdapter } from "@/types/hardware";

/** Long identifiers wrap inside a capped column instead of stretching it. */
const ADAPTER_COLUMNS: Column<NetworkAdapter>[] = [
  indexColumn(),
  {
    key: "name",
    header: "Name",
    wrap: true,
    className: "min-w-[160px] max-w-[160px]",
    cellClassName: PRIMARY_CELL,
    render: (adapter) => (
      <span className="inline-flex items-center">
        {adapter.name}
        {adapter.manuallyCorrected && <ManualBadge />}
      </span>
    ),
  },
  {
    key: "description",
    header: "Description",
    wrap: true,
    className: "min-w-[160px] max-w-[160px]",
  },
  {
    key: "macAddress",
    header: "MAC Address",
    wrap: true,
    cellClassName: "max-w-[110px] break-all",
  },
  { key: "ipv4", header: "IPv4" },
  {
    key: "ipv6",
    header: "IPv6",
    wrap: true,
    className: "min-w-[225px]",
    cellClassName: "break-all",
  },
  { key: "subnetMask", header: "Subnet Mask" },
  { key: "gateway", header: "Gateway" },
  {
    key: "dnsDomain",
    header: "DNS Domain",
    wrap: true,
    cellClassName: "max-w-[120px]",
  },
  {
    key: "dnsServers",
    header: "DNS Servers",
    wrap: true,
    cellClassName: "max-w-[130px]",
  },
  { key: "dhcpServer", header: "DHCP Server" },
  { key: "mtu", header: "MTU" },
  {
    key: "speed",
    header: "Speed",
    wrap: true,
    cellClassName: "max-w-[110px] break-words",
  },
  { key: "type", header: "Type" },
];

interface NetworkTabProps {
  adapters: NetworkAdapter[];
}

/** Network tab: every interface the scan reported, one row each. */
export const NetworkTab = ({ adapters }: NetworkTabProps) => (
  <Card className="px-5 pt-5 pb-6">
    <h2 className="text-base font-bold text-heading">Network Adapters</h2>

    <DataTable
      className="mt-4"
      columns={ADAPTER_COLUMNS}
      rows={adapters}
      rowKey={(adapter) => adapter.id}
      bordered
      uppercaseHeaders
      emptyMessage="No network adapters reported for this device."
    />
  </Card>
);
