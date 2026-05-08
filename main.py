"""
Singularity API — Entry Point
All endpoint logic lives in routers/. Core shared logic in core/.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers.sky import router as sky_router
from routers.forecast import router as forecast_router
from routers.visibility import router as visibility_router
from routers.gear import router as gear_router
from routers.site_ranker import router as site_ranker_router

app = FastAPI(title="Singularity API", version="3.1")

# ── CORS ─────────────────────────────────────────────────────────────────────
_ALLOWED_ORIGINS = [
    "http://localhost:5173",          # Vite dev server
    "http://localhost:4173",          # Vite preview
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", ""),    # Production URL from env
]
_ALLOWED_ORIGINS = [o for o in _ALLOWED_ORIGINS if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Mount Routers ────────────────────────────────────────────────────────────
app.include_router(sky_router)
app.include_router(forecast_router)
app.include_router(visibility_router)
app.include_router(gear_router)
app.include_router(site_ranker_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
