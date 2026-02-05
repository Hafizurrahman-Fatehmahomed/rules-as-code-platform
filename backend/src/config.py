from typing import Optional
import os
import json
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    app_name: str = "Rules-as-Code Platform"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/rules_engine")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # CORS - defaults to localhost for development
    cors_origins: list = ["http://localhost:3000", "http://localhost:8000"]
    
    # API
    api_prefix: str = "/api/v1"
    
    class Config:
        env_file = ".env"
    
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from environment variable"""
        if v is None or v == "":
            # Return defaults if not set
            return ["http://localhost:3000", "http://localhost:8000", "https://rules-as-code-platform.vercel.app"]
        
        if isinstance(v, str):
            # Handle comma-separated string
            if v.startswith("["):
                # Try to parse as JSON
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    # If JSON parsing fails, treat as comma-separated
                    return [origin.strip() for origin in v.split(",")]
            else:
                # Comma-separated string
                return [origin.strip() for origin in v.split(",")]
        
        # Already a list
        return v if isinstance(v, list) else [v]

settings = Settings()
