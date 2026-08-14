import type { InstalledApp } from "@/types/hardware";

/**
 * Every application seen across the estate, not just one device.
 * Compact source form — `[name, version, publisher, install date, size,
 * last used]`. Install dates come off the scan as `YYYYMMDD` strings.
 */
type Row = [
  name: string,
  version: string,
  publisher: string,
  installDate: string,
  size: string,
  lastUsed: string,
];

const UNKNOWN = "Unknown";
const MS = "Microsoft Corporation";
const INTEL = "Intel Corporation";
const NVIDIA = "NVIDIA Corporation";

const ROWS: Row[] = [
  ["DriverSetupUtility", "1.00.3026", "Acer Incorporated", "20210529", "1.9 MB", UNKNOWN],
  ["Acer Configuration Manager", "2.9.25180", "Acer", "20250710", "0.77 MB", UNKNOWN],
  ["Acer Jumpstart", "3.3.22220.22", "Acer", "20240307", "1.88 MB", UNKNOWN],
  ["Acer Jumpstart Agent", "1.6.26187.0", "Acer", "20260709", "2.66 MB", UNKNOWN],
  ["AnyDesk", "46.9.0.14", "AnyDesk Software GmbH", UNKNOWN, "2 MB", "2026-07-30 10:44:45"],
  ["Care Center Service", "4.00.3042", "Acer Incorporated", "20240306", "29.66 MB", "2024-03-06 22:09:00"],
  ["cloudflared", "2024.7.2", "cloudflare", "20260722", "51.64 MB", UNKNOWN],
  ["Copilot", "150.0.4078.96", MS, "20260728", "2712.71 MB", "2026-07-29 18:36:27"],
  ["CryptoID version 2.3.24.423", "2.3.24.423", "Longmai Technology", "20260430", "8.82 MB", UNKNOWN],
  ["DB Browser for SQLite", "3.12.2", "DB Browser for SQLite Team", "20240324", "76.83 MB", "2026-07-28 10:32:28"],
  ["Docker Desktop", "4.40.0", "Docker Inc.", UNKNOWN, "2568.51 MB", "2025-05-11 13:46:06"],
  ["Dynamic App Loader Host Interface Service", "1.0.0.0", INTEL, "20210529", "1.96 MB", UNKNOWN],
  ["Git", "2.44.0", "The Git Development Community", "20250228", "335.56 MB", "2026-07-30 12:00:06"],
  ["GlobalProtect", "6.3.3", "Palo Alto Networks", "20251106", "128.88 MB", UNKNOWN],
  ["Google Chrome", "150.0.7871.187", "Google LLC", "20260728", "473.82 MB", "2026-07-28 18:07:14"],
  ["GoTrust ID Plugin 2.0.12.36", "2.0.12.36", "GoTrust ID Inc.", UNKNOWN, UNKNOWN, UNKNOWN],
  ["heroku", "10.0.0", "Heroku", UNKNOWN, UNKNOWN, UNKNOWN],
  ["Intel(R) Chipset Device Software", "10.1.19243.8183", INTEL, "20210529", "0.07 MB", UNKNOWN],
  ["Intel(R) Icls", "1.0.0.0", INTEL, "20210529", "16.57 MB", UNKNOWN],
  ["Intel(R) LMS", "1.0.0.0", INTEL, "20210529", "21.06 MB", UNKNOWN],
  ["Intel(R) Management Engine Components", "1.0.0.0", INTEL, "20210529", "87.88 MB", UNKNOWN],
  ["Intel(R) Management Engine Driver", "1.0.0.0", INTEL, "20210529", "0.03 MB", UNKNOWN],
  ["Intel HW Accelerated Execution Manager", "7.8.5", INTEL, UNKNOWN, "0.67 MB", UNKNOWN],
  ["IntelliJ IDEA 2023.3.5", "233.14808.21", "JetBrains s.r.o.", UNKNOWN, UNKNOWN, UNKNOWN],
  ["LibreOffice 24.2.3.2", "24.2.3.2", "The Document Foundation", "20240510", "752.46 MB", "2024-05-10 20:24:09"],

  ["Microsoft 365 Apps for enterprise", "16.0.18025.20160", MS, "20260112", "5820.44 MB", "2026-07-30 09:12:40"],
  ["Microsoft Edge", "129.0.2792.89", MS, "20260716", "684.12 MB", "2026-07-30 08:55:02"],
  ["Microsoft Edge WebView2 Runtime", "129.0.2792.89", MS, "20260716", "412.30 MB", "2026-07-30 08:55:02"],
  ["Microsoft OneDrive", "24.181.0908.0002", MS, "20260620", "308.55 MB", "2026-07-30 11:02:19"],
  ["Microsoft Teams", "24215.1000.3039.1069", MS, "20260624", "486.90 MB", "2026-07-30 10:14:33"],
  ["Microsoft Update Health Tools", "5.72.0.0", MS, "20250418", "1.02 MB", UNKNOWN],
  ["Microsoft Visual C++ 2013 Redistributable (x64)", "12.0.40664", MS, "20230914", "20.44 MB", UNKNOWN],
  ["Microsoft Visual C++ 2013 Redistributable (x86)", "12.0.40664", MS, "20230914", "17.20 MB", UNKNOWN],
  ["Microsoft Visual C++ 2015-2022 Redistributable (x64)", "14.40.33810", MS, "20260214", "24.88 MB", UNKNOWN],
  ["Microsoft Visual C++ 2015-2022 Redistributable (x86)", "14.40.33810", MS, "20260214", "21.06 MB", UNKNOWN],
  ["Microsoft Visual Studio Code", "1.94.2", MS, "20260709", "412.30 MB", "2026-07-30 12:31:55"],
  ["Microsoft Windows Desktop Runtime 6.0.36", "6.0.36", MS, "20250910", "144.22 MB", UNKNOWN],
  ["Microsoft Windows Desktop Runtime 8.0.11", "8.0.11", MS, "20260521", "158.70 MB", UNKNOWN],
  ["MongoDB Compass", "1.44.4", "MongoDB Inc.", "20260226", "402.88 MB", "2026-06-27 15:48:10"],
  ["Mozilla Firefox", "131.0.3", "Mozilla", "20260705", "312.66 MB", "2026-07-27 20:06:44"],
  ["Mozilla Thunderbird", "128.3.1", "Mozilla", "20260215", "268.14 MB", "2026-07-20 09:33:21"],
  ["MySQL Workbench", "8.0.40", "Oracle Corporation", "20251206", "480.60 MB", "2026-07-03 17:22:08"],
  ["Node.js", "20.18.0", "OpenJS Foundation", "20260118", "88.44 MB", "2026-07-30 12:00:06"],
  ["Notepad++", "8.7.1", "Notepad++ Team", "20260604", "18.92 MB", "2026-07-29 14:41:37"],
  ["NVIDIA Control Panel", "8.1.966.0", NVIDIA, "20210529", "62.10 MB", "2026-07-22 19:05:12"],
  ["NVIDIA GeForce Experience", "3.28.0.417", NVIDIA, "20250718", "412.60 MB", "2026-05-14 21:17:49"],
  ["NVIDIA Graphics Driver", "560.94", NVIDIA, "20260620", "1180.30 MB", UNKNOWN],
  ["NVIDIA PhysX System Software", "9.23.1019", NVIDIA, "20210529", "48.22 MB", UNKNOWN],
  ["OBS Studio", "30.2.3", "OBS Project", "20250924", "402.15 MB", "2026-04-30 11:28:55"],
  ["Obsidian", "1.7.4", "Obsidian.md", "20260312", "348.70 MB", "2026-07-28 22:04:16"],

  ["Oracle VirtualBox", "7.1.4", "Oracle Corporation", "20260201", "268.44 MB", "2026-06-18 13:09:27"],
  ["Postman", "11.16.3", "Postman Inc.", "20260305", "512.44 MB", "2026-07-27 16:52:03"],
  ["PostgreSQL 16", "16.4", "PostgreSQL Global Development Group", "20260223", "886.55 MB", "2026-07-15 10:41:38"],
  ["PowerShell 7", "7.4.5", MS, "20260119", "182.30 MB", "2026-07-30 12:44:01"],
  ["PowerToys", "0.85.1", MS, "20260619", "348.90 MB", "2026-07-30 09:20:55"],
  ["PuTTY", "0.81", "Simon Tatham", "20240710", "4.12 MB", "2026-06-26 18:31:44"],
  ["Python 3.12.6", "3.12.6150.0", "Python Software Foundation", "20260204", "118.66 MB", "2026-07-30 12:15:22"],
  ["Python Launcher", "3.12.9150.0", "Python Software Foundation", "20260204", "2.44 MB", "2026-07-30 12:15:22"],
  ["qBittorrent", "5.0.0", "The qBittorrent Project", "20250611", "62.80 MB", UNKNOWN],
  ["Realtek Audio Driver", "6.0.9668.1", "Realtek Semiconductor", "20210529", "58.22 MB", UNKNOWN],
  ["Realtek Card Reader", "10.0.19041.31298", "Realtek Semiconductor", "20210529", "12.40 MB", UNKNOWN],
  ["Rufus", "4.6", "Akeo Consulting", "20250820", "1.44 MB", UNKNOWN],
  ["ShareX", "16.1.0", "ShareX Team", "20260127", "46.72 MB", "2026-07-23 08:19:06"],
  ["Slack", "4.41.97", "Slack Technologies", "20260318", "398.66 MB", "2026-07-30 09:47:12"],
  ["Snipping Tool", "11.2409.24.0", MS, "20260624", "18.55 MB", "2026-07-30 11:36:40"],
  ["Spotify", "1.2.47.401", "Spotify AB", "20260408", "312.90 MB", "2026-07-29 21:58:33"],
  ["Steam", "1728594001", "Valve Corporation", "20241105", "610.28 MB", "2026-03-21 20:12:47"],
  ["Sublime Text", "4.4180", "Sublime HQ", "20250714", "44.60 MB", "2026-02-08 12:05:19"],
  ["TeamViewer", "15.58.4", "TeamViewer Germany GmbH", "20260129", "268.44 MB", "2026-07-17 15:27:51"],
  ["Telegram Desktop", "5.6.3", "Telegram FZ-LLC", "20260222", "128.30 MB", "2026-07-30 07:44:09"],
  ["VLC media player", "3.0.21", "VideoLAN", "20250624", "182.44 MB", "2026-07-13 22:38:26"],
  ["WhatsApp", "2.2440.6.0", "WhatsApp LLC", "20260629", "398.15 MB", "2026-07-30 10:59:14"],
  ["WinRAR", "7.01", "win.rar GmbH", "20250226", "8.90 MB", "2026-07-26 17:03:58"],
  ["WinSCP", "6.3.5", "Martin Prikryl", "20250918", "42.16 MB", "2026-06-14 09:52:31"],
  ["Wireshark", "4.4.1", "The Wireshark Foundation", "20260213", "820.44 MB", "2026-07-06 14:20:05"],
];

export const SOFTWARE_ASSETS: InstalledApp[] = ROWS.map(
  ([name, version, publisher, installDate, size, lastUsed], index) => ({
    id: `${index + 1}`,
    sequence: index + 1,
    name,
    version,
    publisher,
    installDate,
    size,
    lastUsed,
  }),
);
