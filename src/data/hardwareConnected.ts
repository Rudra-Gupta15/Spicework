import type {
  ConnectedDevice,
  ConnectedVia,
  HardwareDevice,
} from "@/types/hardware";

/**
 * Compact source form — `[name, category, connected via, manufacturer]`.
 * Port and serial are rarely reported by the scan, so they default to "-";
 * add the two optional entries when a device does report them.
 */
type Row = [
  name: string,
  category: string,
  via: ConnectedVia,
  manufacturer: string,
  port?: string,
  serial?: string,
];

const ROWS_BY_DEVICE: Record<string, Row[]> = {
  "laptop-bml": [
    ["Realtek PCIe GbE Family Controller", "Net", "PCI / PCIe Slot", "Realtek"],
    ["iQOO Z10R 5G", "Bluetooth", "Bluetooth", "Microsoft"],
    [
      "KINGSTON OM8PCP3512F-AA",
      "DiskDrive",
      "Drive Bus",
      "(Standard disk drives)",
    ],
    ["Microsoft Streaming Service Proxy", "MEDIA", "Other", "Microsoft"],
    [
      "USB Composite Device",
      "USB",
      "USB",
      "(Standard USB Host Controller)",
    ],
    ["Generic Attribute Profile", "Bluetooth", "Other", "Microsoft"],
    ["NVIDIA GeForce GTX 1650", "Display", "PCI / PCIe Slot", "NVIDIA"],
    ["trüke Air Buds Lite", "Bluetooth", "Bluetooth", "Microsoft"],
    ["HID-compliant mouse", "Mouse", "HID (USB/Bluetooth)", "Microsoft"],
    ["HID-compliant fido", "HIDClass", "HID (USB/Bluetooth)", "FIDO"],

    /* PCI / PCIe Slot */
    [
      "Intel(R) Wi-Fi 6 AX201 160MHz",
      "Net",
      "PCI / PCIe Slot",
      "Intel Corporation",
    ],
    ["Intel(R) UHD Graphics", "Display", "PCI / PCIe Slot", "Intel Corporation"],
    ["Realtek High Definition Audio", "MEDIA", "PCI / PCIe Slot", "Realtek"],
    [
      "Standard NVM Express Controller",
      "SCSIAdapter",
      "PCI / PCIe Slot",
      "(Standard NVM Express Controller)",
    ],

    /* Bluetooth */
    ["Intel(R) Wireless Bluetooth(R)", "Bluetooth", "Bluetooth", "Intel Corporation"],
    ["Microsoft Bluetooth Enumerator", "Bluetooth", "Bluetooth", "Microsoft"],
    ["Microsoft Bluetooth LE Enumerator", "Bluetooth", "Bluetooth", "Microsoft"],
    ["FireBoltt 137", "Bluetooth", "Bluetooth", "Microsoft"],
    ["trüke Buds F1 Ultra", "Bluetooth", "Bluetooth", "Microsoft"],
    ["Trüke Fit 1+", "Bluetooth", "Bluetooth", "Microsoft"],
    ["YCOM STROM", "Bluetooth", "Bluetooth", "Microsoft"],
    ["boAt Rockerz 550", "Bluetooth", "Bluetooth", "Microsoft"],
    [
      "Bluetooth LE Generic Attribute Service",
      "Bluetooth",
      "Bluetooth",
      "Microsoft",
    ],
    [
      "Bluetooth Device (RFCOMM Protocol TDI)",
      "Bluetooth",
      "Bluetooth",
      "Microsoft",
    ],
    [
      "Bluetooth Device (Personal Area Network)",
      "Net",
      "Bluetooth",
      "Microsoft",
    ],

    /* HID (USB/Bluetooth) */
    ["HID Keyboard Device", "Keyboard", "HID (USB/Bluetooth)", "Microsoft"],
    [
      "HID-compliant consumer control device",
      "HIDClass",
      "HID (USB/Bluetooth)",
      "Microsoft",
    ],
    [
      "HID-compliant system controller",
      "HIDClass",
      "HID (USB/Bluetooth)",
      "Microsoft",
    ],
    [
      "ELAN Precision Touchpad",
      "Mouse",
      "HID (USB/Bluetooth)",
      "ELAN Microelectronics",
    ],

    /* USB */
    [
      "Intel(R) USB 3.20 eXtensible Host Controller",
      "USB",
      "USB",
      "Intel Corporation",
    ],
    ["USB Root Hub (USB 3.0)", "USB", "USB", "(Standard USB Host Controller)"],
    ["Generic USB Hub", "USB", "USB", "(Standard USB Host Controller)"],
    ["USB Input Device", "HIDClass", "USB", "(Standard system devices)"],

    /* USB Storage */
    [
      "SanDisk Ultra Flair USB Device",
      "DiskDrive",
      "USB Storage",
      "(Standard disk drives)",
    ],

    /* Internal Panel */
    [
      "Generic PnP Monitor",
      "Monitor",
      "Internal Panel",
      "(Standard monitor types)",
    ],

    /* Other — software, system and virtual devices */
    ["Generic Access Profile", "Bluetooth", "Other", "Microsoft"],
    ["Device Identification Service", "Bluetooth", "Other", "Microsoft"],
    ["High Definition Audio Controller", "MEDIA", "Other", "Microsoft"],
    [
      "Microsoft Device Association Root Enumerator",
      "System",
      "Other",
      "Microsoft",
    ],
    ["Composite Bus Enumerator", "System", "Other", "Microsoft"],
    [
      "Microsoft System Management BIOS Driver",
      "System",
      "Other",
      "Microsoft",
    ],
    ["Microsoft ACPI-Compliant System", "System", "Other", "Microsoft"],
    [
      "Plug and Play Software Device Enumerator",
      "System",
      "Other",
      "Microsoft",
    ],
    ["Remote Desktop Device Redirector Bus", "System", "Other", "Microsoft"],
    ["UMBus Root Bus Enumerator", "System", "Other", "Microsoft"],
    ["Microsoft Virtual Drive Enumerator", "System", "Other", "Microsoft"],
    [
      "Microsoft Hyper-V Virtualization Infrastructure Driver",
      "System",
      "Other",
      "Microsoft",
    ],
    ["Microsoft RRAS Root Enumerator", "System", "Other", "Microsoft"],
    [
      "NDIS Virtual Network Adapter Enumerator",
      "System",
      "Other",
      "Microsoft",
    ],
    ["Microsoft Wi-Fi Direct Virtual Adapter", "Net", "Other", "Microsoft"],
    ["WAN Miniport (IP)", "Net", "Other", "Microsoft"],
    ["WAN Miniport (IPv6)", "Net", "Other", "Microsoft"],
    ["WAN Miniport (Network Monitor)", "Net", "Other", "Microsoft"],
    ["Microsoft Kernel Debug Network Adapter", "Net", "Other", "Microsoft"],
  ],

  "asus-rog": [
    [
      "AMD Radeon(TM) 780M Graphics",
      "Display",
      "PCI / PCIe Slot",
      "Advanced Micro Devices",
    ],
    ["NVIDIA GeForce RTX 4060 Laptop GPU", "Display", "PCI / PCIe Slot", "NVIDIA"],
    ["MediaTek Wi-Fi 6E MT7922", "Net", "PCI / PCIe Slot", "MediaTek Inc."],
    [
      "Samsung PM9A1 NVMe 1TB",
      "DiskDrive",
      "Drive Bus",
      "(Standard disk drives)",
    ],
    ["MediaTek Bluetooth Adapter", "Bluetooth", "Bluetooth", "MediaTek Inc."],
    ["MX Master 3S", "Mouse", "HID (USB/Bluetooth)", "Microsoft"],
    ["ASUS Aura Keyboard", "HIDClass", "HID (USB/Bluetooth)", "ASUSTeK"],
    [
      "USB Composite Device",
      "USB",
      "USB",
      "(Standard USB Host Controller)",
    ],
    [
      "Generic PnP Monitor",
      "Monitor",
      "Internal Panel",
      "(Standard monitor types)",
    ],
    ["Microsoft ACPI-Compliant System", "System", "Other", "Microsoft"],
    ["Composite Bus Enumerator", "System", "Other", "Microsoft"],
    ["WAN Miniport (IP)", "Net", "Other", "Microsoft"],
  ],

  "dell-latitude": [
    [
      "Intel(R) Ethernet Connection I219-LM",
      "Net",
      "PCI / PCIe Slot",
      "Intel Corporation",
    ],
    ["Intel(R) Iris(R) Xe Graphics", "Display", "PCI / PCIe Slot", "Intel Corporation"],
    [
      "Micron 2450 NVMe 512GB",
      "DiskDrive",
      "Drive Bus",
      "(Standard disk drives)",
    ],
    ["Dell KB216 Wired Keyboard", "Keyboard", "HID (USB/Bluetooth)", "Microsoft"],
    ["Dell WD19S Dock", "USB", "USB", "(Standard USB Host Controller)"],
    ["Jabra Evolve2 40", "MEDIA", "USB", "Microsoft"],
    [
      "Generic PnP Monitor",
      "Monitor",
      "Internal Panel",
      "(Standard monitor types)",
    ],
    ["Microsoft ACPI-Compliant System", "System", "Other", "Microsoft"],
    ["WAN Miniport (IPv6)", "Net", "Other", "Microsoft"],
  ],

  "macbook-pro": [
    ["Apple M3 Pro GPU", "Display", "Internal Panel", "Apple Inc."],
    ["Apple Force Touch Trackpad", "Mouse", "HID (USB/Bluetooth)", "Apple Inc."],
    ["Apple Internal Keyboard", "Keyboard", "HID (USB/Bluetooth)", "Apple Inc."],
    ["AirPods Pro (2nd gen)", "Bluetooth", "Bluetooth", "Apple Inc."],
    ["Apple Broadcom Bluetooth", "Bluetooth", "Bluetooth", "Apple Inc."],
    ["APPLE SSD AP1024Z", "DiskDrive", "Drive Bus", "Apple Inc."],
    ["Studio Display", "Monitor", "USB", "Apple Inc."],
    ["Apple Wi-Fi 6E (802.11ax)", "Net", "Other", "Apple Inc."],
  ],

  "hp-laserjet": [
    ["HP Control Panel Touchscreen", "HIDClass", "Internal Panel", "HP Inc."],
    ["HP Jetdirect 3100w", "Net", "Other", "HP Inc."],
    ["HP Walk-up USB Port", "USB", "USB", "HP Inc."],
    ["HP Embedded Flash", "DiskDrive", "Drive Bus", "HP Inc."],
    ["HP 550-sheet Paper Tray", "System", "Other", "HP Inc."],
  ],

  "cisco-catalyst": [
    ["Console Port", "System", "Other", "Cisco Systems"],
    ["USB Flash Slot", "USB", "USB", "Cisco Systems"],
    ["StackWise-160 Module", "System", "Other", "Cisco Systems"],
    ["PWR-C5-1KWAC", "System", "Other", "Cisco Systems"],
    ["Bootflash", "DiskDrive", "Drive Bus", "Cisco Systems"],
    ["Vlan1 (Management)", "Net", "Other", "Cisco Systems"],
  ],
};

const toDevice = (
  [name, category, via, manufacturer, port, serial]: Row,
  index: number,
): ConnectedDevice => ({
  id: `${index + 1}`,
  sequence: index + 1,
  name,
  category,
  via,
  port: port ?? "-",
  manufacturer,
  serial: serial ?? "-",
  status: "OK",
});

export const getConnectedDevices = (
  device: HardwareDevice,
): ConnectedDevice[] => (ROWS_BY_DEVICE[device.id] ?? []).map(toDevice);

/** `{ via -> count }` for the filter chips, in the order they are shown. */
export const countByVia = (
  devices: ConnectedDevice[],
): { via: ConnectedVia; count: number }[] => {
  const counts = new Map<ConnectedVia, number>();
  for (const device of devices)
    counts.set(device.via, (counts.get(device.via) ?? 0) + 1);

  return [...counts.entries()]
    .map(([via, count]) => ({ via, count }))
    .sort((a, b) => a.via.localeCompare(b.via));
};
