import json
import sqlite3

from backend.core.config import DB_PATH, logger
from backend.db import get_db


def get_audit_indexes():
    audit_index: dict = {}
    audit_mac_index: dict = {}
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
    return audit_index, audit_mac_index
