"""Database initialization and utilities"""

import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from ..config import settings

engine = None
async_session_maker = None

async def init_db():
    """Initialize database connection"""
    global engine, async_session_maker
    
    engine = create_async_engine(
        settings.database_url.replace("postgresql", "postgresql+asyncpg"),
        echo=settings.debug,
    )
    
    async_session_maker = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    print("✅ Database initialized")

async def get_session():
    """Get database session"""
    async with async_session_maker() as session:
        yield session
