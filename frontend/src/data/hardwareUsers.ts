import type { HardwareDevice, UserAccount } from "@/types/hardware";

/**
 * Compact source form — `[username, home directory, last login, user type]`,
 * plus optional `licensed` / `currentUser`. Most accounts never sign in, so
 * the scan reports "Unknown" for both directory and login.
 */
type Row = [
  username: string,
  homeDirectory: string,
  lastLogin: string,
  userType: string,
  licensed?: string,
  currentUser?: string,
];

const UNKNOWN = "Unknown";
const ADMIN = "Administrator";
const STANDARD = "Standard";

const ROWS_BY_DEVICE: Record<string, Row[]> = {
  "laptop-bml": [
    ["Administrator", UNKNOWN, UNKNOWN, ADMIN],
    ["CodexSandboxOffline", UNKNOWN, UNKNOWN, STANDARD],
    ["CodexSandboxOnline", UNKNOWN, UNKNOWN, STANDARD],
    ["DefaultAccount", UNKNOWN, UNKNOWN, STANDARD],
    ["Guest", UNKNOWN, UNKNOWN, STANDARD],
    ["progr", "C:\\Users\\progr", UNKNOWN, ADMIN],
    ["WDAGUtilityAccount", UNKNOWN, UNKNOWN, STANDARD],
    ["WsiAccount", "C:\\Users\\WsiAccount", "2026-07-26 19:03:28", STANDARD],
  ],

  "asus-rog": [
    ["Administrator", UNKNOWN, UNKNOWN, ADMIN, "No", "No"],
    [
      "alex.rivera",
      "C:\\Users\\alex.rivera",
      "2026-07-30 08:16:44",
      ADMIN,
      "Yes",
      "Yes",
    ],
    ["DefaultAccount", UNKNOWN, UNKNOWN, STANDARD, "No", "No"],
    ["Guest", UNKNOWN, UNKNOWN, STANDARD, "No", "No"],
    ["WDAGUtilityAccount", UNKNOWN, UNKNOWN, STANDARD, "No", "No"],
  ],

  "dell-latitude": [
    ["Administrator", UNKNOWN, UNKNOWN, ADMIN, "No", "No"],
    ["DefaultAccount", UNKNOWN, UNKNOWN, STANDARD, "No", "No"],
    ["Guest", UNKNOWN, UNKNOWN, STANDARD, "No", "No"],
    [
      "priya.sharma",
      "C:\\Users\\priya.sharma",
      "2026-07-28 09:05:20",
      STANDARD,
      "Yes",
      "Yes",
    ],
    [
      "itsupport",
      "C:\\Users\\itsupport",
      "2026-07-14 11:22:07",
      ADMIN,
      "No",
      "No",
    ],
  ],

  "macbook-pro": [
    ["root", "/var/root", UNKNOWN, ADMIN, "No", "No"],
    [
      "jane.doe",
      "/Users/jane.doe",
      "2026-07-29 07:50:31",
      ADMIN,
      "Yes",
      "Yes",
    ],
    ["guest", "/Users/Guest", UNKNOWN, STANDARD, "No", "No"],
  ],

  "hp-laserjet": [
    ["admin", UNKNOWN, "2026-07-22 14:08:11", ADMIN, "No", "Yes"],
    ["service", UNKNOWN, UNKNOWN, STANDARD, "No", "No"],
  ],

  "cisco-catalyst": [
    ["netops", UNKNOWN, "2026-07-20 09:31:02", ADMIN, "No", "Yes"],
    ["admin", UNKNOWN, "2026-06-19 02:09:44", ADMIN, "No", "No"],
    ["monitor", UNKNOWN, UNKNOWN, STANDARD, "No", "No"],
  ],
};

export const getDeviceUsers = (device: HardwareDevice): UserAccount[] =>
  (ROWS_BY_DEVICE[device.id] ?? []).map(
    (
      [username, homeDirectory, lastLogin, userType, licensed, currentUser],
      index,
    ) => ({
      id: username,
      sequence: index + 1,
      username,
      homeDirectory,
      lastLogin,
      userType,
      licensed: licensed ?? "No",
      currentUser: currentUser ?? "Yes",
    }),
  );
