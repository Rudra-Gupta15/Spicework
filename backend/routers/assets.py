import json
import os
from datetime import datetime

from fastapi import APIRouter, HTTPException

from backend.core.config import ASSET_METADATA_DIR, logger
from backend.models.assets import AssetMetadata
from backend.services.common import model_to_dict

router = APIRouter()


@router.post("/asset-metadata")
def save_asset_metadata(metadata: AssetMetadata):
    metadata.last_updated = datetime.now().isoformat()
    path = f"{ASSET_METADATA_DIR}/{metadata.device_id}.json"
    try:
        with open(path, "w") as f:
            json.dump(model_to_dict(metadata), f, indent=4)
        logger.info(f"Asset metadata saved: {metadata.device_id}")
        return {"status": "saved", "device_id": metadata.device_id}
    except Exception as e:
        logger.error(f"Failed to save asset metadata: {e}")
        raise HTTPException(status_code=500, detail="Failed to save metadata.")


@router.get("/asset-metadata/{device_id}")
def get_asset_metadata(device_id: str):
    path = f"{ASSET_METADATA_DIR}/{device_id}.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Asset not found.")
    with open(path) as f:
        return json.load(f)


@router.put("/asset-metadata/{device_id}")
def update_asset_metadata(device_id: str, metadata: AssetMetadata):
    metadata.device_id   = device_id
    metadata.last_updated = datetime.now().isoformat()
    path = f"{ASSET_METADATA_DIR}/{device_id}.json"
    with open(path, "w") as f:
        json.dump(model_to_dict(metadata), f, indent=4)
    return {"status": "updated", "device_id": device_id}


@router.delete("/asset-metadata/{device_id}")
def delete_asset_metadata(device_id: str):
    path = f"{ASSET_METADATA_DIR}/{device_id}.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Asset not found.")
    os.remove(path)
    return {"status": "deleted", "device_id": device_id}


@router.get("/assets")
def list_assets():
    assets = []
    if os.path.exists(ASSET_METADATA_DIR):
        for fn in os.listdir(ASSET_METADATA_DIR):
            if fn.endswith(".json"):
                try:
                    with open(f"{ASSET_METADATA_DIR}/{fn}") as f:
                        assets.append(json.load(f))
                except Exception:
                    pass
    assets.sort(key=lambda x: x.get("last_updated", ""), reverse=True)
    return {"assets": assets, "total": len(assets)}
