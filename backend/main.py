"""Atelier FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.portfolio_routes import router as portfolio_router
from routes.campaign_routes import router as campaign_router
from routes.discover_routes import router as discover_router
from routes.ai_routes import router as ai_router
from routes.collab_routes import (
    shortlist_router, invitation_router, engagement_router
)

settings = get_settings()

app = FastAPI(
    title="Atelier API",
    description="Where AI Creativity Meets Brands — backend API for the Atelier creator marketplace. Problem statement proposed by Kampus.VC.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(portfolio_router)
app.include_router(campaign_router)
app.include_router(discover_router)
app.include_router(ai_router)
app.include_router(shortlist_router)
app.include_router(invitation_router)
app.include_router(engagement_router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "product": "Atelier API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}


@app.head("/health", tags=["health"], include_in_schema=False)
def health_head():
    from fastapi import Response
    return Response(status_code=200)
