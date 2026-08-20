import asyncio
import json
import logging
from app.db.session import AsyncSessionFactory
from app.ai.orchestrator.nearby_orchestrator import nearby_orchestrator
from app.ai.orchestrator.itinerary_orchestrator import itinerary_orchestrator

logging.basicConfig(level=logging.INFO)

async def main():
    async with AsyncSessionFactory() as db:
        print("\n=======================================================")
        print("1. RUNNING SAMPLE AI NEARBY SEARCH QUERY")
        print("Query: 'nearest temples for ongole' (Lat: 15.5057, Lng: 80.0499)")
        print("=======================================================")

        nearby_res = await nearby_orchestrator.execute_nearby_crew(
            db=db,
            query="nearest temples for ongole",
            latitude=15.5057,
            longitude=80.0499
        )

        nearby_dict = nearby_res.model_dump()
        print(json.dumps(nearby_dict, indent=2))

        print("\n=======================================================")
        print("2. RUNNING SAMPLE AI ITINERARY PLANNING QUERY")
        print("Query: 'Plan itinerary for Hyderabad for 2 days'")
        print("=======================================================")

        itinerary_res = await itinerary_orchestrator.execute_itinerary_crew(
            db=db,
            user_uuid="demo-user-123",
            query="Plan itinerary for Hyderabad for 2 days",
            destination="Hyderabad",
            days=2
        )

        print(json.dumps(itinerary_res, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
