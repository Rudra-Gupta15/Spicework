import type { HardwareDevice, LoginRecord } from "@/types/hardware";

/** Tabs on the software detail screen. */
export const SOFTWARE_TABS = ["Login", "User", "Software"] as const;

export type SoftwareTab = (typeof SOFTWARE_TABS)[number];

/** Compact source form — `[user, domain, logon type, timestamp]`. */
type Row = [
  user: string,
  domain: string,
  logonType: string,
  timestamp: string,
];

const LOGINS_BY_DEVICE: Record<string, Row[]> = {
  "laptop-bml": [
    [
      "programmershubham755@gmail.com",
      "MicrosoftAccount",
      "Unlock",
      "2026-07-30 11:43:15",
    ],
    [
      "programmershubham755@gmail.com",
      "MicrosoftAccount",
      "Unlock",
      "2026-07-30 11:43:15",
    ],
    [
      "programmershubham755@gmail.com",
      "MicrosoftAccount",
      "Cached Interactive",
      "2026-07-30 11:43:15",
    ],
    [
      "programmershubham755@gmail.com",
      "MicrosoftAccount",
      "Cached Interactive",
      "2026-07-30 11:43:15",
    ],
  ],

  "asus-rog": [
    [
      "alex.rivera@prevoyance.com",
      "PREVOYANCE",
      "Interactive",
      "2026-07-30 08:16:44",
    ],
    [
      "alex.rivera@prevoyance.com",
      "PREVOYANCE",
      "Unlock",
      "2026-07-30 09:41:02",
    ],
    [
      "alex.rivera@prevoyance.com",
      "PREVOYANCE",
      "Cached Interactive",
      "2026-07-29 20:38:17",
    ],
  ],

  "dell-latitude": [
    [
      "priya.sharma@prevoyance.com",
      "PREVOYANCE",
      "Interactive",
      "2026-07-28 09:05:20",
    ],
    [
      "priya.sharma@prevoyance.com",
      "PREVOYANCE",
      "Unlock",
      "2026-07-28 13:22:41",
    ],
    [
      "itsupport@prevoyance.com",
      "PREVOYANCE",
      "Remote Interactive",
      "2026-07-14 11:22:07",
    ],
  ],

  "macbook-pro": [
    ["jane.doe@prevoyance.com", "Local", "Interactive", "2026-07-29 07:50:31"],
    ["jane.doe@prevoyance.com", "Local", "Unlock", "2026-07-29 14:08:55"],
  ],

  "cisco-catalyst": [
    ["netops@prevoyance.com", "TACACS+", "Network", "2026-07-20 09:31:02"],
    ["admin", "Local", "Interactive", "2026-06-19 02:09:44"],
  ],
};

export const getDeviceLogins = (device: HardwareDevice): LoginRecord[] =>
  (LOGINS_BY_DEVICE[device.id] ?? []).map(
    ([user, domain, logonType, timestamp], index) => ({
      id: `${index + 1}`,
      sequence: index + 1,
      user,
      domain,
      logonType,
      timestamp,
    }),
  );
