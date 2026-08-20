import sys
import os
import asyncio

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.db.session import async_engine, AsyncSessionFactory
from app.db.init_db import init_db

async def setup():
    print("Initializing Database Schema...")
    async with async_engine.begin() as conn:
        print("Recreating database tables in correct dependency order...")
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")

    print("Seeding Initial Categories & Admin Account...")
    async with AsyncSessionFactory() as session:
        await init_db(session)
    print("Seeding completed successfully!")

if __name__ == "__main__":
    try:
        asyncio.run(setup())
        print("Database setup finished completely.")
        sys.exit(0)
    except Exception as e:
        print(f"Error during DB setup: {e}", file=sys.stderr)
        sys.exit(1)
