import json
import sqlite3

from fastapi import APIRouter, HTTPException

from backend.core.config import DB_PATH
from backend.db import get_db

router = APIRouter()


@router.get("/devices")
@router.get("/api/devices")
def list_audited_devices():
    devices = {}
    with get_db(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute('''
            SELECT mac_address, computer_name, os_name, execution_datetime, audit_data
            FROM device_audits
            ORDER BY id DESC, execution_datetime DESC
        ''')
        for row in cursor:
            name = (row['computer_name'] or "Unknown").strip()
            os_name = (row['os_name'] or "Unknown").strip()

            # Categorize OS family to pair same OS versions (e.g. Windows 10 vs 11 or macOS vs macOS)
            os_lower = os_name.lower()
            if "windows" in os_lower:
                os_family = "windows"
            elif "mac" in os_lower:
                os_family = "mac"
            elif "ubuntu" in os_lower or "linux" in os_lower:
                os_family = "linux"
            else:
                os_family = os_lower

            key = (name.lower(), os_family)
            if key not in devices:
                user = "Unknown"
                model_name = ""
                if row['audit_data']:
                    try:
                        ad = json.loads(row['audit_data'])
                        user = ad.get("current_user") or ad.get("user") or "Unknown"
                        hw = ad.get("hardware_details", {})
                        if isinstance(hw, dict):
                            mfr = (hw.get("manufacturer") or "").strip()
                            mdl = (hw.get("model") or "").strip()
                            if mfr and mdl and mdl != "Unknown" and mdl != "N/A":
                                if "ASUSTeK" in mfr or "ASUS" in mfr:
                                    mfr = "ASUS"
                                elif "Hewlett" in mfr or "HP" in mfr:
                                    mfr = "HP"
                                elif "Lenovo" in mfr:
                                    mfr = "Lenovo"
                                elif "Dell" in mfr:
                                    mfr = "Dell"
                                elif "Apple" in mfr:
                                    mfr = "Apple"
                                mdl_clean = mdl.split('_')[0].strip()
                                # Reject disk/SSD model strings masquerading as laptop model names
                                mdl_lower = mdl_clean.lower()
                                is_disk_model = any(x in mdl_lower for x in [
                                    'gb', 'tb', 'nvme', 'ssd', 'hdd', 'nand', 'sata', 'mzvl', 'kioxia',
                                    'kingston', 'om8pcp', 'om8', 'samsung', 'wd', 'wdc', 'seagate',
                                    'toshiba', 'micron', 'crucial', 'sandisk', 'evmnv', 'pm9', 'pm98',
                                    'hynix', 'sk hynix', 'lexar', 'transcend', 'adata', 'sn5000', 'sn750', 'sn850',
                                    '512', '256', '128', '1tb', '2tb', 'disk', 'drive', 'storage'
                                ])
                                if is_disk_model:
                                    pass  # skip — leave model_name empty, fallback to computer_name
                                elif mdl_clean.lower().startswith(mfr.lower()):
                                    model_name = mdl_clean
                                else:
                                    model_name = f"{mfr} {mdl_clean}".strip()
                    except Exception:
                        pass

                mac = row['mac_address']
                uid = mac if mac and mac != "Unknown" else name
                devices[key] = {
                    "id": uid,
                    "computer_name": name,
                    "model_name": model_name or name,
                    "os_name": os_name,
                    "username": user,
                    "last_seen": row['execution_datetime']
                }

    device_list = list(devices.values())
    device_list.sort(key=lambda x: x.get("last_seen", ""), reverse=True)
    return {"devices": device_list, "total": len(device_list)}


@router.get("/api/software/{device_id}")
def get_software_for_device(device_id: str):
    latest_data = None
    with get_db(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute('''
            SELECT audit_data, execution_datetime FROM device_audits
            WHERE LOWER(mac_address) = LOWER(?) OR LOWER(computer_name) = LOWER(?)
            ORDER BY id DESC, execution_datetime DESC LIMIT 1
        ''', (device_id, device_id))
        row = cursor.fetchone()
        if row:
            latest_data = json.loads(row['audit_data'])
            latest_ts = row['execution_datetime']

    if not latest_data:
        raise HTTPException(status_code=404, detail=f"No audit found for device: {device_id}")
    return {
        "id":                 device_id,
        "computer_name":      latest_data.get("computer_name", "Unknown"),
        "current_user":       latest_data.get("current_user", "Unknown"),
        "last_audit":         latest_ts,
        "software_inventory": latest_data.get("software_inventory", []),
        "total":              len(latest_data.get("software_inventory", [])),
        "os_name":            latest_data.get("os_name", ""),
        "os_version":         latest_data.get("os_version", ""),
        "os_build":           latest_data.get("os_build", ""),
        "last_boot":          latest_data.get("last_boot", ""),
        "uptime":             latest_data.get("uptime", ""),
        "architecture":       latest_data.get("architecture", ""),
        "license_status":     latest_data.get("license_status", ""),
        "firewall":           latest_data.get("firewall", "Unknown"),
        "bitlocker":          latest_data.get("bitlocker", "Unknown"),
        "secure_boot":        latest_data.get("secure_boot", "Unknown"),
        "tpm":                latest_data.get("tpm", "Unknown"),
        "hardware_details":   latest_data.get("hardware_details", {}),
        "network_details":    latest_data.get("network_details", []),
        "user_accounts":      latest_data.get("user_accounts", []),
        "login_history":      latest_data.get("login_history", []),
        "hotfixes":           latest_data.get("hotfixes", []),
        "antivirus":          latest_data.get("antivirus", "")
    }


@router.get("/api/device-diff/{device_id}")
def get_device_diff(device_id: str):
    """
    Compare the two most recent audit scans for a device.
    Returns: newly installed apps, removed apps, hardware changes.
    """
    scans = []
    with get_db(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute('''
            SELECT audit_data, execution_datetime FROM device_audits
            WHERE LOWER(mac_address) = LOWER(?) OR LOWER(computer_name) = LOWER(?)
            ORDER BY execution_datetime DESC LIMIT 2
        ''', (device_id, device_id))
        for row in cursor:
            scans.append((row['execution_datetime'], json.loads(row['audit_data'])))

    if len(scans) < 2:
        return {
            "has_diff": False,
            "message": "Need at least 2 scans to generate a change report.",
            "scan_count": len(scans),
        }

    # Sort by datetime string ascending — latest last
    scans.sort(key=lambda x: x[0])
    prev_ts,  prev  = scans[-2]
    curr_ts,  curr  = scans[-1]

    # ── Software diff ─────────────────────────────────────────────────────────
    def sw_key(entry):
        """Unique key: lowercase name + version."""
        if isinstance(entry, dict):
            return f"{(entry.get('name') or '').strip().lower()}||{(entry.get('version') or '').strip()}"
        return ""

    prev_sw = {sw_key(s): s for s in prev.get("software_inventory", []) if sw_key(s)}
    curr_sw = {sw_key(s): s for s in curr.get("software_inventory", []) if sw_key(s)}

    installed_keys = set(curr_sw) - set(prev_sw)
    removed_keys   = set(prev_sw) - set(curr_sw)

    newly_installed = [curr_sw[k] for k in sorted(installed_keys)]
    newly_removed   = [prev_sw[k] for k in sorted(removed_keys)]

    # ── Hardware diff ─────────────────────────────────────────────────────────
    hw_changes = []
    hw_fields  = [
        ("cpu",           "Processor (CPU)"),
        ("ram",           "Memory (RAM)"),
        ("disk",          "Storage"),
        ("serial_number", "Serial Number"),
        ("manufacturer",  "Manufacturer"),
        ("model",         "Model"),
    ]
    prev_hw = prev.get("hardware_details", {}) if isinstance(prev.get("hardware_details"), dict) else {}
    curr_hw = curr.get("hardware_details", {}) if isinstance(curr.get("hardware_details"), dict) else {}

    for field, label in hw_fields:
        pv = str(prev_hw.get(field, "Unknown") or "Unknown").strip()
        cv = str(curr_hw.get(field, "Unknown") or "Unknown").strip()
        if pv != cv:
            hw_changes.append({"field": label, "previous": pv, "current": cv})

    # OS changes
    for field, label in [("os_name", "OS Name"), ("os_version", "OS Version"), ("architecture", "Architecture")]:
        pv = str(prev.get(field, "Unknown") or "Unknown").strip()
        cv = str(curr.get(field, "Unknown") or "Unknown").strip()
        if pv != cv:
            hw_changes.append({"field": label, "previous": pv, "current": cv})

    return {
        "has_diff":        True,
        "scan_count":      len(scans),
        "previous_scan":   prev_ts,
        "current_scan":    curr_ts,
        "newly_installed": newly_installed,
        "newly_removed":   newly_removed,
        "hw_changes":      hw_changes,
        "summary": {
            "installed_count": len(newly_installed),
            "removed_count":   len(newly_removed),
            "hw_change_count": len(hw_changes),
        }
    }
