import type { HardwareDevice, VideoController } from "@/types/hardware";

/**
 * Video controllers per device. Mock data — swap for the scan payload.
 * These line up with the `Display` rows on the Connected Devices tab.
 */
const VIDEO_BY_DEVICE: Record<string, VideoController[]> = {
  "laptop-bml": [
    {
      id: "gtx-1650",
      sequence: 1,
      name: "NVIDIA GeForce GTX 1650",
      adapterName: "NVIDIA GeForce GTX 1650",
      videoProcessor: "NVIDIA GeForce GTX 1650",
      driverVersion: "31.0.15.4633",
    },
    {
      id: "intel-uhd",
      sequence: 2,
      name: "Intel(R) UHD Graphics",
      adapterName: "Intel(R) UHD Graphics",
      videoProcessor: "Intel(R) UHD Graphics Family",
      driverVersion: "27.20.100.8280",
    },
  ],

  "asus-rog": [
    {
      id: "rtx-4060",
      sequence: 1,
      name: "NVIDIA GeForce RTX 4060 Laptop GPU",
      adapterName: "NVIDIA GeForce RTX 4060 Laptop GPU",
      videoProcessor: "NVIDIA GeForce RTX 4060 Laptop GPU",
      driverVersion: "32.0.15.6094",
    },
    {
      id: "radeon-780m",
      sequence: 2,
      name: "AMD Radeon(TM) 780M Graphics",
      adapterName: "AMD Radeon(TM) 780M Graphics",
      videoProcessor: "AMD Radeon Graphics Processor (0x15BF)",
      driverVersion: "31.0.24033.1003",
    },
  ],

  "dell-latitude": [
    {
      id: "iris-xe",
      sequence: 1,
      name: "Intel(R) Iris(R) Xe Graphics",
      adapterName: "Intel(R) Iris(R) Xe Graphics",
      videoProcessor: "Intel(R) Iris(R) Xe Graphics Family",
      driverVersion: "31.0.101.4502",
    },
  ],

  "macbook-pro": [
    {
      id: "m3-pro-gpu",
      sequence: 1,
      name: "Apple M3 Pro GPU",
      adapterName: "Apple M3 Pro (18-core GPU)",
      videoProcessor: "Apple Silicon Integrated Graphics",
      driverVersion: "Built-in (macOS 14.5)",
    },
  ],
};

export const getVideoControllers = (
  device: HardwareDevice,
): VideoController[] => VIDEO_BY_DEVICE[device.id] ?? [];
