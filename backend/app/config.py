from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(
        default="postgresql://pokemon:pokemon123@localhost:5432/pokemon_todo"
    )
    
    # LM Studio
    LM_STUDIO_URL: str = Field(default="http://localhost:1234")
    
    # CORS
    CORS_ORIGINS: str = Field(default="http://localhost:5173,http://localhost:3000")
    
    # App
    APP_ENV: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

def get_settings() -> Settings:
    return Settings()

settings = get_settings()