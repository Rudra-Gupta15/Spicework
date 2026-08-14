import sqlite3
from datetime import datetime

from fastapi import APIRouter

from backend.core.config import DB_PATH
from backend.db import get_db
from backend.models.lifecycle import LifecycleData, TicketData

router = APIRouter()


@router.get("/api/lifecycle/{identifier}")
def get_lifecycle(identifier: str):
    with get_db(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        # Search by mac_address first, then by computer_name (device name)
        row = conn.execute(
            "SELECT * FROM asset_lifecycle WHERE mac_address=? OR computer_name=? LIMIT 1",
            (identifier, identifier)
        ).fetchone()
    if row:
        return dict(row)
    return {}


@router.post("/api/lifecycle")
@router.post("/api/lifecycle/{identifier}")
def save_lifecycle(data: LifecycleData, identifier: str = ""):
    now = datetime.now().isoformat()
    # If mac_address is not set in body but identifier is in URL, use it as computer_name key
    mac = data.mac_address or identifier or data.computer_name
    cname = data.computer_name or identifier
    with get_db(DB_PATH) as conn:
        conn.execute('''
            INSERT INTO asset_lifecycle
                (mac_address, computer_name, owner, location, vendor, status, warranty_start, warranty_end,
                 warranty_notes, warranty_provider, purchase_price, purchase_date, supplier, po_number, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(mac_address) DO UPDATE SET
                computer_name=excluded.computer_name, owner=excluded.owner, location=excluded.location, vendor=excluded.vendor,
                status=excluded.status, warranty_start=excluded.warranty_start, warranty_end=excluded.warranty_end,
                warranty_notes=excluded.warranty_notes, warranty_provider=excluded.warranty_provider,
                purchase_price=excluded.purchase_price, purchase_date=excluded.purchase_date,
                supplier=excluded.supplier, po_number=excluded.po_number, updated_at=excluded.updated_at
        ''', (mac, cname, data.owner, data.location, data.vendor, data.status,
              data.warranty_start, data.warranty_end, data.warranty_notes, data.warranty_provider,
              data.purchase_price, data.purchase_date, data.supplier, data.po_number, now))
        conn.commit()
    return {"status": "saved"}


@router.get("/api/tickets/{mac_address}")
def get_tickets(mac_address: str):
    with get_db(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM asset_tickets WHERE mac_address=? ORDER BY created_at DESC", (mac_address,)).fetchall()
    return [dict(r) for r in rows]


@router.post("/api/tickets")
def create_ticket(data: TicketData):
    now = datetime.now().isoformat()
    with get_db(DB_PATH) as conn:
        conn.execute('''
            INSERT INTO asset_tickets (mac_address, computer_name, ticket_number, summary, status, assigned, priority, mtbf, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        ''', (data.mac_address, data.computer_name, data.ticket_number, data.summary,
              data.status, data.assigned, data.priority, data.mtbf, now, now))
        conn.commit()
    return {"status": "created"}


@router.put("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: int, data: TicketData):
    now = datetime.now().isoformat()
    with get_db(DB_PATH) as conn:
        conn.execute('''
            UPDATE asset_tickets SET summary=?, status=?, assigned=?, priority=?, mtbf=?, updated_at=?
            WHERE id=?
        ''', (data.summary, data.status, data.assigned, data.priority, data.mtbf, now, ticket_id))
        conn.commit()
    return {"status": "updated"}


@router.delete("/api/tickets/{ticket_id}")
def delete_ticket(ticket_id: int):
    with get_db(DB_PATH) as conn:
        conn.execute("DELETE FROM asset_tickets WHERE id=?", (ticket_id,))
        conn.commit()
    return {"status": "deleted"}
