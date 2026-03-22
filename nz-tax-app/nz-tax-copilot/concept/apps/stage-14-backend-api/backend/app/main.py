"""
NZ Tax Copilot Backend API
FastAPI application entry point with middleware, routing, and telemetry configuration.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.core.config import settings
from app.core.telemetry import configure_telemetry
from app.api.v1 import auth, workspaces, income, crypto, documents, questionnaire, guidance, calculations, exports
from app.health import router as health_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    logger.info("Starting NZ Tax Copilot Backend API")
    configure_telemetry()
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"API Version: {settings.API_VERSION}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down NZ Tax Copilot Backend API")


app = FastAPI(
    title="NZ Tax Copilot API",
    description="Backend API for NZ individual tax return preparation",
    version=settings.API_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.ENVIRONMENT == "dev" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT == "dev" else None,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Correlation-ID"],
)


# Request tracking middleware
@app.middleware("http")
async def track_requests(request: Request, call_next):
    """Track all API requests in Application Insights."""
    start_time = time.time()
    
    # Extract user_id from request state (set by auth dependency)
    user_id = getattr(request.state, "user_id", "anonymous")
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Log request telemetry
    logger.info(
        "API Request",
        extra={
            "custom_dimensions": {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "user_id": user_id
            }
        }
    )
    
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Capture unhandled exceptions in Application Insights."""
    logger.exception(
        "Unhandled Exception",
        extra={
            "custom_dimensions": {
                "method": request.method,
                "path": request.url.path,
                "user_id": getattr(request.state, "user_id", "anonymous")
            }
        }
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "type": "about:blank",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An unexpected error occurred. Please try again later.",
            "instance": request.url.path
        }
    )


# Include routers
app.include_router(health_router, tags=["health"])
app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(workspaces.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(income.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(crypto.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(documents.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(questionnaire.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(guidance.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(calculations.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(exports.router, prefix=f"/api/{settings.API_VERSION}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "NZ Tax Copilot API",
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": f"/api/docs" if settings.ENVIRONMENT == "dev" else None
    }