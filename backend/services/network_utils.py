import concurrent.futures
import json
import platform
import socket
import sqlite3
import subprocess

from backend.core.config import DB_PATH, logger
from backend.db import get_db


def _is_windows() -> bool:
    return platform.system() == "Windows"


def _run_cmd(cmd: str):
    """Run a shell command and return (stdout, returncode)."""
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=20, shell=True)
        return r.stdout, r.returncode
    except Exception as e:
        return str(e), -1


def _run_cmd_args(args: list):
    """Run a command using an argument list without shell=True for security."""
    try:
        r = subprocess.run(args, capture_output=True, text=True, timeout=20, shell=False)
        return r.stdout, r.returncode
    except Exception as e:
        return str(e), -1


def calculate_wifi_distance(signal_percent: int = 0, rssi_dbm: int = None) -> dict:
    """Calculate estimated router distance in meters using RSSI log-distance path loss model."""
    if rssi_dbm is None:
        if signal_percent <= 0:
            return {"distance_m": None, "distance_str": "Unknown"}
        rssi_dbm = int((signal_percent / 2.0) - 100.0)

    # Reference power at 1m: -40 dBm, Path loss exponent n = 2.8 (indoor)
    tx_power_1m = -40.0
    n = 2.8
    exp = (tx_power_1m - float(rssi_dbm)) / (10.0 * n)
    distance_m = round(10.0 ** exp, 1)

    if distance_m < 0.3:
        distance_m = 0.3

    return {
        "rssi_dbm": int(rssi_dbm),
        "distance_m": distance_m,
        "distance_str": f"~{distance_m} meters" if distance_m < 10 else f"~{int(distance_m)} meters"
    }


def resolve_hostname_netbios(ip_str: str) -> str:
    """Attempt Reverse DNS or NetBIOS nbtstat to find real hostname."""
    try:
        name, _, _ = socket.gethostbyaddr(ip_str)
        if name and name != ip_str and not name.startswith("192."):
            return name.split(".")[0].upper()
    except Exception:
        pass

    if _is_windows():
        try:
            out, rc = _run_cmd(f"nbtstat -A {ip_str}")
            if rc == 0 and out:
                for line in out.splitlines():
                    if "<00>" in line and "UNIQUE" in line:
                        nb_name = line.split()[0].strip()
                        if nb_name and not nb_name.startswith("__"):
                            return nb_name.upper()
        except Exception:
            pass

    return None


def enrich_scan_results(scan_result: dict) -> dict:
    audit_index: dict = {}
    audit_mac_index: dict = {}

    # 1. Query SQLite audits.db
    try:
        with get_db(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT mac_address, computer_name, os_name, execution_datetime, audit_data FROM device_audits ORDER BY id DESC")
            for row in cursor:
                c_name = row['computer_name'] or "Unknown"
                c_mac  = row['mac_address'] or "Unknown"
                d_os   = row['os_name'] or "Unknown"
                last_dt = row['execution_datetime'] or ""

                c_user = "Unknown"
                net_ips = []
                if row['audit_data']:
                    try:
                        ad = json.loads(row['audit_data'])
                        c_user = ad.get("current_user") or "Unknown"
                        users  = ad.get("user_accounts", [])
                        if c_user == "Unknown" and users and isinstance(users, list):
                            c_user = users[0].get("name", "Unknown") if isinstance(users[0], dict) else "Unknown"

                        for net in ad.get("network_details", []):
                            if isinstance(net, dict):
                                raw_ip = net.get("ip_address", "") or net.get("ipv4", "")
                                for ip_part in str(raw_ip).split(","):
                                    ip_clean = ip_part.strip()
                                    if ip_clean and ip_clean not in ("Unknown", "N/A", ""):
                                        net_ips.append(ip_clean)
                    except Exception:
                        pass

                info = {
                    "id":            c_mac if c_mac != "Unknown" else c_name,
                    "computer_name": c_name,
                    "os_name":       d_os,
                    "username":      c_user,
                    "last_audit":    last_dt
                }

                if c_mac != "Unknown":
                    clean_mac = c_mac.replace(":", "").replace("-", "").upper()
                    if clean_mac not in audit_mac_index:
                        audit_mac_index[clean_mac] = info

                for ip_item in net_ips:
                    if ip_item not in audit_index:
                        audit_index[ip_item] = info
    except Exception as db_e:
        logger.warning(f"Could not load audits from DB for scan enrichment: {db_e}")

    # 2. Enrich discovered devices (Parallel NetBIOS/DNS resolution for fast 2-second completion)
    unaudited_devices = []
    for device in scan_result.get("discovered", []):
        ip = device.get("ip", "")

        scan_mac = None
        for p in device.get("port_labels", []):
            p_str = str(p)
            if p_str.startswith("MAC: "):
                scan_mac = p_str[5:].replace(":", "").replace("-", "").strip().upper()
                break

        a = audit_mac_index.get(scan_mac) if scan_mac else None
        if not a:
            a = audit_index.get(ip)

        if a:
            device["id"]            = a["id"]
            device["computer_name"] = a["computer_name"]
            device["os_name"]       = a["os_name"]
            device["username"]      = a["username"]
            device["last_audit"]    = a["last_audit"]
            device["audit_status"]  = "audited"
        else:
            unaudited_devices.append(device)

    def _resolve_device_name(device):
        ip = device.get("ip", "")
        raw_h = device.get("hostname")
        if not raw_h or raw_h in ("N/A", ip):
            nb_h = resolve_hostname_netbios(ip)
            if nb_h:
                device["computer_name"] = nb_h
            else:
                dev_t = device.get("device_type", "Network Device")
                clean_t = dev_t.replace(" Device", "").replace(" (Firewalled)", "").replace(" Workstation/Server", "").strip()
                last_octet = ip.split(".")[-1] if "." in ip else "Device"
                device["computer_name"] = f"{clean_t} ({last_octet})" if clean_t and clean_t != "Unknown" else f"Host-{last_octet}"
        else:
            device["computer_name"] = raw_h

        device["os_name"]       = device.get("device_type", "Network Target")
        device["username"]      = "Unaudited Target"
        device["last_audit"]    = "—"
        device["audit_status"]  = "unaudited"

    if unaudited_devices:
        with concurrent.futures.ThreadPoolExecutor(max_workers=32) as executor:
            list(executor.map(_resolve_device_name, unaudited_devices))

    return scan_result
