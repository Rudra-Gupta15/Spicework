#         INFRAPULSE WORKSTATION COMPLIANCE AUDIT BACKEND (FASTAPI)
# Version: 3.0.0 — Full IT Asset Management Edition

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.core.config import FRONTEND_DIR
from backend.routers import (
    assets,
    audits,
    devices,
    discovery,
    lifecycle,
    osquery_settings,
    osquery_telemetry,
    scripts,
    wifi,
)

app = FastAPI(title="InfraPulse IT Asset Management Portal", version="3.0.0")

cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
if cors_origins_env:
    origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(scripts.router)
app.include_router(audits.router)
app.include_router(assets.router)
app.include_router(devices.router)
app.include_router(discovery.router)
app.include_router(wifi.router)
app.include_router(lifecycle.router)
app.include_router(osquery_settings.router)
app.include_router(osquery_telemetry.router)

# Catch-all static mount for the frontend SPA — must stay last so it never
# shadows the explicit routes registered by the routers above.
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
