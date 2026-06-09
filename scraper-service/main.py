"""
PennyWise Scraper Service — Main Entry Point
FastAPI application for the price comparison scraper microservice.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from api.routes import router as scraper_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    # Startup
    print(f"[SCRAPER] PennyWise Scraper Service starting on port {settings.SERVICE_PORT}")
    print(f"[SCRAPER] Backend URL: {settings.BACKEND_URL}")
    print(f"[SCRAPER] Redis: {'Connected' if settings.REDIS_URL else 'Disabled (no REDIS_URL)'}")

    # Start scheduler if enabled
    if settings.SCHEDULER_ENABLED:
        try:
            from scheduler import start_scheduler
            start_scheduler()
            print(f"[SCHEDULER] Enabled - refreshing every {settings.REFRESH_INTERVAL_HOURS}h")
        except Exception as e:
            print(f"[SCHEDULER] Failed to start: {e}")

    yield

    # Shutdown
    print("[SCRAPER] Service shutting down")


app = FastAPI(
    title="PennyWise Scraper Service",
    description="Price comparison scraper for Pakistani e-commerce platforms",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - only allow the Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(scraper_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVICE_HOST,
        port=settings.SERVICE_PORT,
        reload=settings.DEBUG,
    )
