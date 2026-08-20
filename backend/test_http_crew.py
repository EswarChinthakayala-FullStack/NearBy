import asyncio
import json
import urllib.request
from app.db.session import AsyncSessionFactory
from app.crud.crud_user import crud_user
from app.core.security import create_access_token

async def main():
    async with AsyncSessionFactory() as db:
        user = await crud_user.get_by_email(db, "admin@nearbyapp.com")
        token = create_access_token(user_uuid=user.uuid)

        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/v1/ai/nearby",
            data=json.dumps({
                "query": "nearest temples for ongole",
                "latitude": 15.5057,
                "longitude": 80.0499
            }).encode(),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )

        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode())
        print("HTTP STATUS:", res.getcode())
        print("SUCCESS:", data.get("success"))
        print("ACTIVE AGENTS:", data['data']['query_understanding']['active_agents'])
        print("RECOMMENDATIONS COUNT:", len(data['data']['recommendations']))

if __name__ == "__main__":
    asyncio.run(main())
