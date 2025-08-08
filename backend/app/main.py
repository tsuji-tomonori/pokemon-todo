from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from app.core.database import engine, Base
from app.core.error_handlers import register_error_handlers
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pokemon TODO API",
    description="A gamified TODO application with Pokemon battle elements",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Register error handlers
register_error_handlers(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Pokemon TODO API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}