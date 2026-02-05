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
    
    # CORS - define as string to prevent JSON parsing, parse in method
    cors_origins_str: str = "http://localhost:3000,http://localhost:8000"
    
    # API
    api_prefix: str = "/api/v1"
    
    class Config:
        env_file = ".env"
    
    def get_cors_origins(self) -> list:
        """Get CORS origins as a list"""
        cors_env = os.getenv("CORS_ORIGINS")
        
        # If explicitly set in environment, use it
        if cors_env and cors_env.strip():
            origins_str = cors_env.strip()
            # Try JSON parsing first
            if origins_str.startswith("["):
                try:
                    return json.loads(origins_str)
                except (json.JSONDecodeError, ValueError):
                    # Fall back to comma-separated
                    pass
            # Parse as comma-separated
            return [origin.strip() for origin in origins_str.split(",") if origin.strip()]
        
        # Default for development
        if self.environment == "development":
            return ["http://localhost:3000", "http://localhost:8000"]
        
        # Default for production - include Vercel domain
        return [
            "https://rules-as-code-platform.vercel.app",
            "http://localhost:3000",
            "http://localhost:8000"
        ]

settings = Settings()
