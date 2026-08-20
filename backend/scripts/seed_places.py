import sys
import os
import asyncio
from decimal import Decimal

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import AsyncSessionFactory
from app.crud.crud_category import crud_category
from app.models.place import Place
from app.models.enums import PlaceStatus, PlaceSource

DEMO_PLACES = [
    {
        "name": "Red Fort (Lal Qila)",
        "slug": "red-fort-lal-qila",
        "category_name": "Historical",
        "description": "Historic fort in Old Delhi that served as the main residence of the Mughal Emperors.",
        "address": "Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006",
        "city": "Delhi",
        "state": "Delhi",
        "country": "India",
        "latitude": Decimal("28.6562"),
        "longitude": Decimal("77.2410"),
        "entry_fee": "₹50 (Indian), ₹600 (Foreigner)",
        "best_time_to_visit": "October to March",
        "status": PlaceStatus.PUBLISHED.value,
        "avg_rating": Decimal("4.60"),
        "total_reviews": 128,
        "total_favorites": 45,
        "source": PlaceSource.ADMIN.value,
    },
    {
        "name": "Qutub Minar",
        "slug": "qutub-minar",
        "category_name": "Historical",
        "description": "A UNESCO World Heritage Site in the Mehrauli area of South Delhi, India.",
        "address": "Seth Sarai, Mehrauli, New Delhi, Delhi 110030",
        "city": "Delhi",
        "state": "Delhi",
        "country": "India",
        "latitude": Decimal("28.5245"),
        "longitude": Decimal("77.1855"),
        "entry_fee": "₹40 (Indian), ₹600 (Foreigner)",
        "best_time_to_visit": "November to February",
        "status": PlaceStatus.PUBLISHED.value,
        "avg_rating": Decimal("4.70"),
        "total_reviews": 210,
        "total_favorites": 88,
        "source": PlaceSource.ADMIN.value,
    },
    {
        "name": "Lotus Temple",
        "slug": "lotus-temple",
        "category_name": "Temple",
        "description": "Notable for its lotuslike shape, it has become a prominent attraction in New Delhi.",
        "address": "Lotus Temple Rd, Bahapur, Shambhu Dayal Bagh, Kalkaji, New Delhi, Delhi 110019",
        "city": "Delhi",
        "state": "Delhi",
        "country": "India",
        "latitude": Decimal("28.5535"),
        "longitude": Decimal("77.2588"),
        "entry_fee": "Free",
        "best_time_to_visit": "October to March",
        "status": PlaceStatus.PUBLISHED.value,
        "avg_rating": Decimal("4.50"),
        "total_reviews": 95,
        "total_favorites": 34,
        "source": PlaceSource.ADMIN.value,
    },
    {
        "name": "India Gate",
        "slug": "india-gate",
        "category_name": "Historical",
        "description": "War memorial located astride the Rajpath, on the eastern edge of the ceremonial axis of New Delhi.",
        "address": "Rajpath, India Gate, New Delhi, Delhi 110001",
        "city": "Delhi",
        "state": "Delhi",
        "country": "India",
        "latitude": Decimal("28.6129"),
        "longitude": Decimal("77.2295"),
        "entry_fee": "Free",
        "best_time_to_visit": "October to March",
        "status": PlaceStatus.PUBLISHED.value,
        "avg_rating": Decimal("4.80"),
        "total_reviews": 340,
        "total_favorites": 120,
        "source": PlaceSource.ADMIN.value,
    },
]

async def seed_places():
    async with AsyncSessionFactory() as db:
        for pdata in DEMO_PLACES:
            cat_name = pdata.pop("category_name")
            cat = await crud_category.get_by_name(db, name=cat_name)
            if not cat:
                cat = await crud_category.get_multi(db, limit=1)
                cat_id = cat[0].id if cat else 1
            else:
                cat_id = cat.id

            place = Place(category_id=cat_id, **pdata)
            db.add(place)
        await db.commit()
        print("Demo tourist places seeded into database!")

if __name__ == "__main__":
    asyncio.run(seed_places())
