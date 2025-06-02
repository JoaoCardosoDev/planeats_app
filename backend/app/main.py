from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import create_db_and_tables
from app.api.v1 import api_router
from app.models import User


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()  # Ensure tables are created on startup
    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.APP_VERSION,
    description="PlanEats API for pantry management and recipe recommendations",
    lifespan=lifespan,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "PlanEats Backend is running!", "version": settings.APP_VERSION}  # Corrected attribute


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/init-db")
async def initialize_database():
    """Initialize database tables - call this once after startup"""
    try:
        create_db_and_tables()
        return {"message": "Database initialized successfully"}
    except Exception as e:
        return {"error": f"Failed to initialize database: {str(e)}"}
