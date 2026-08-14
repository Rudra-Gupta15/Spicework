import type { HardwareDevice, Printer } from "@/types/hardware";

/**
 * Printers reported per device. Mock data — swap for the scan payload.
 * Counts here line up with the "Printers" field on the Overview tab.
 */
const PRINTERS_BY_DEVICE: Record<string, Printer[]> = {
  "laptop-bml": [
    {
      id: "hp-laser-103",
      sequence: 1,
      name: "HP Laser 103 107 108",
      systemName: "LAPTOP-BML1A93C",
      portName: "USB001",
      status: "Unknown",
      bidirectional: "No",
    },
  ],

  "asus-rog": [
    {
      id: "hp-laserjet-pro",
      sequence: 1,
      name: "HP LaserJet Pro M404dn",
      systemName: "ASUS-ROG-G14",
      portName: "192.168.1.90",
      status: "Ready",
      bidirectional: "Yes",
    },
    {
      id: "pdf-writer",
      sequence: 2,
      name: "Microsoft Print to PDF",
      systemName: "ASUS-ROG-G14",
      portName: "PORTPROMPT:",
      status: "Ready",
      bidirectional: "No",
    },
  ],

  "hp-laserjet": [
    {
      id: "self",
      sequence: 1,
      name: "HP LaserJet Pro",
      systemName: "HP-LJ-5523",
      portName: "Internal",
      status: "Ready",
      bidirectional: "Yes",
    },
  ],
};

export const getDevicePrinters = (device: HardwareDevice): Printer[] =>
  PRINTERS_BY_DEVICE[device.id] ?? [];
