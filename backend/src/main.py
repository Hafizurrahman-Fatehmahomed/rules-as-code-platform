from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager

from .config import settings
from .api import scenarios, rules, calculations
from .services.cache import init_cache
from .services.database import init_db
from .rules_engine.loader import load_rules

# Lifespan event handler for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Rules-as-Code Platform")
    await init_db()
    await init_cache()
    load_rules()
    yield
    # Shutdown
    print("🛑 Shutting down Rules-as-Code Platform")

# Create FastAPI app
app = FastAPI(
    title="Rules-as-Code Platform API",
    description="Dutch Pension & Benefits Scenario Comparison Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - get origins from settings with safe parsing
cors_origins = settings.get_cors_origins()
print(f"✅ CORS enabled for: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.environment,
        "cors_origins": settings.get_cors_origins()
    }

# Include routers
app.include_router(scenarios.router, prefix="/api/v1/scenarios", tags=["Scenarios"])
app.include_router(rules.router, prefix="/api/v1/rules", tags=["Rules"])
app.include_router(calculations.router, prefix="/api/v1/calculations", tags=["Calculations"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "Rules-as-Code Platform",
        "status": "operational",
        "docs": "/docs"
    }


