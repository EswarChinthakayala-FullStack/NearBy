import uuid as uuid_lib
import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, delete
from app.models.itinerary import SavedItinerary
from app.schemas.itinerary import ItineraryResponse, ItineraryListItem, WeatherSummarySchema, ItineraryDaySchema, ItineraryActivitySchema

logger = logging.getLogger(__name__)

class ItineraryStorageService:
    """DB Repository service for saving, querying, updating, and deleting user travel itineraries."""

    async def save_itinerary(
        self,
        db: AsyncSession,
        user_id: int,
        raw_itinerary: Dict[str, Any]
    ) -> SavedItinerary:
        item_uuid = str(uuid_lib.uuid4())
        dest = raw_itinerary.get("destination", "Destination")
        title = raw_itinerary.get("title", f"Trip to {dest}")
        weather = raw_itinerary.get("weather_summary", {})
        tips = raw_itinerary.get("travel_tips", [])
        days = raw_itinerary.get("days", [])

        day_count_label = "1 Day" if len(days) == 1 else f"{len(days)} Days"
        db_obj = SavedItinerary(
            uuid=item_uuid,
            user_id=user_id,
            destination=dest,
            title=title,
            travel_dates=day_count_label,
            budget=raw_itinerary.get("budget", "Moderate"),
            itinerary_data=days,
            reasoning_data={
                "summary": raw_itinerary.get("summary", ""),
                "travel_tips": tips,
                "original_prompt": raw_itinerary.get("original_prompt") or raw_itinerary.get("query") or f"Travel plan for {dest}",
                "theme": raw_itinerary.get("theme") or "Heritage & Culture"
            },
            route_data={"weather_summary": weather}
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_user_itineraries(
        self,
        db: AsyncSession,
        user_id: int,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[SavedItinerary], int]:
        stmt_filter = (SavedItinerary.user_id == user_id) | (SavedItinerary.user_id == 1) if user_id > 0 else True
        count_stmt = select(func.count()).select_from(SavedItinerary).where(stmt_filter)
        total_raw = (await db.execute(count_stmt)).scalar()
        try:
            total = int(total_raw) if total_raw is not None else 0
        except (ValueError, TypeError):
            total = 0

        offset = (page - 1) * page_size
        stmt = (
            select(SavedItinerary)
            .where(stmt_filter)
            .order_by(desc(SavedItinerary.created_at))
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(stmt)
        items = result.scalars().all()
        return items, total

    async def get_by_identifier(
        self,
        db: AsyncSession,
        identifier: str,
        user_id: Optional[int] = None
    ) -> Optional[SavedItinerary]:
        def build_stmt(with_user: bool):
            stmt = select(SavedItinerary)
            if identifier.isdigit():
                stmt = stmt.where(SavedItinerary.id == int(identifier))
            else:
                stmt = stmt.where(SavedItinerary.uuid == identifier)
            if with_user and user_id is not None:
                stmt = stmt.where(SavedItinerary.user_id == user_id)
            return stmt

        # Try query scoped to user_id
        res = await db.execute(build_stmt(with_user=True))
        item = res.scalars().first()
        if not item and user_id is not None:
            # Fall back to un-scoped query
            res = await db.execute(build_stmt(with_user=False))
            item = res.scalars().first()

        return item

    async def delete_itinerary(self, db: AsyncSession, identifier: str, user_id: int) -> bool:
        db_obj = await self.get_by_identifier(db, identifier, user_id)
        if not db_obj:
            return False

        await db.delete(db_obj)
        await db.commit()
        return True

    async def update_itinerary(
        self,
        db: AsyncSession,
        identifier: str,
        user_id: int,
        title: Optional[str] = None,
        travel_dates: Optional[str] = None,
        budget: Optional[str] = None
    ) -> Optional[SavedItinerary]:
        db_obj = await self.get_by_identifier(db, identifier, user_id)
        if not db_obj:
            return None

        if title is not None:
            db_obj.title = title.strip()
        if travel_dates is not None:
            db_obj.travel_dates = travel_dates.strip()
        if budget is not None:
            db_obj.budget = budget.strip()

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def duplicate_itinerary(
        self,
        db: AsyncSession,
        identifier: str,
        user_id: int
    ) -> Optional[SavedItinerary]:
        original = await self.get_by_identifier(db, identifier, user_id)
        if not original:
            return None

        dup_uuid = str(uuid_lib.uuid4())
        duplicate = SavedItinerary(
            uuid=dup_uuid,
            user_id=user_id,
            destination=original.destination,
            title=f"{original.title} (Copy)",
            travel_dates=original.travel_dates,
            budget=original.budget,
            itinerary_data=original.itinerary_data,
            reasoning_data=original.reasoning_data,
            route_data=original.route_data
        )
        db.add(duplicate)
        await db.commit()
        await db.refresh(duplicate)
        return duplicate

    def to_response_schema(self, db_obj: SavedItinerary) -> ItineraryResponse:
        days = db_obj.itinerary_data if isinstance(db_obj.itinerary_data, list) else []
        reasoning = db_obj.reasoning_data if isinstance(db_obj.reasoning_data, dict) else {}
        route = db_obj.route_data if isinstance(db_obj.route_data, dict) else {}

        weather_raw = route.get("weather_summary", {})
        weather_schema = WeatherSummarySchema(
            temperature_c=float(weather_raw.get("temperature_c", 26.0)),
            condition=str(weather_raw.get("condition", "Pleasant")),
            humidity_pct=int(weather_raw.get("humidity_pct", 60)),
            rain_probability_pct=int(weather_raw.get("rain_probability_pct", 10)),
            recommendation=str(weather_raw.get("recommendation", "Great weather for outdoor activities."))
        )

        day_schemas = []
        total_places = 0
        total_travel_mins = 0

        for d in days:
            if isinstance(d, dict):
                act_schemas = []
                for a in d.get("activities", []):
                    if isinstance(a, dict):
                        total_places += 1
                        t_mins = int(a.get("travel_minutes", 0))
                        total_travel_mins += t_mins
                        act_schemas.append(
                            ItineraryActivitySchema(
                                time=str(a.get("time", "09:00 AM")),
                                place_slug=str(a.get("place_slug", "")),
                                place_name=str(a.get("place_name", "Attraction")),
                                reason=str(a.get("reason", "Must-visit local spot")),
                                travel_minutes=t_mins,
                                estimated_duration=str(a.get("estimated_duration", "2h"))
                            )
                        )
                day_schemas.append(
                    ItineraryDaySchema(
                        day=int(d.get("day", len(day_schemas) + 1)),
                        theme=str(d.get("theme", "Explorer")),
                        activities=act_schemas
                    )
                )

        calc_dist_km = round(max(3.5, total_places * 2.8 + total_travel_mins * 0.4), 1)
        dates_label = f"1 Day" if len(day_schemas) == 1 else f"{len(day_schemas)} Days"

        clean_title = db_obj.title
        if "Sightseeing" in clean_title or "2-Day" in clean_title:
            clean_title = clean_title.replace("2-Day Sightseeing Itinerary", f"{dates_label} Itinerary")
            clean_title = clean_title.replace("Sightseeing Itinerary", "Itinerary")
            clean_title = clean_title.replace("Sightseeing", "Tour")
        if len(day_schemas) == 1:
            clean_title = clean_title.replace("2-Day", "1 Day").replace("2 Days", "1 Day")

        prompt_text = reasoning.get("original_prompt") or reasoning.get("query") or f"Trip to {db_obj.destination}"
        trip_theme = reasoning.get("theme") or "Heritage & Culture"

        return ItineraryResponse(
            id=db_obj.uuid,
            destination=db_obj.destination,
            title=clean_title,
            summary=str(reasoning.get("summary", f"Travel itinerary for {db_obj.destination}")),
            original_prompt=prompt_text,
            theme=trip_theme,
            places_count=total_places,
            estimated_distance_km=calc_dist_km,
            travel_dates=db_obj.travel_dates or dates_label,
            budget=db_obj.budget,
            trip_type="Leisure",
            weather_summary=weather_schema,
            travel_tips=reasoning.get("travel_tips", []),
            days=day_schemas,
            created_at=db_obj.created_at.isoformat() if db_obj.created_at else None
        )

    def to_list_item_schema(self, db_obj: SavedItinerary) -> ItineraryListItem:
        days = db_obj.itinerary_data if isinstance(db_obj.itinerary_data, list) else []
        reasoning = db_obj.reasoning_data if isinstance(db_obj.reasoning_data, dict) else {}
        total_places = sum(len(d.get("activities", [])) for d in days if isinstance(d, dict))
        calc_dist_km = round(max(3.5, total_places * 2.8), 1)

        dates_label = f"1 Day" if len(days) == 1 else f"{len(days)} Days"

        clean_title = db_obj.title
        if "Sightseeing" in clean_title or "2-Day" in clean_title:
            clean_title = clean_title.replace("2-Day Sightseeing Itinerary", f"{dates_label} Itinerary")
            clean_title = clean_title.replace("Sightseeing Itinerary", "Itinerary")
            clean_title = clean_title.replace("Sightseeing", "Tour")
        if len(days) == 1:
            clean_title = clean_title.replace("2-Day", "1 Day").replace("2 Days", "1 Day")

        prompt_text = reasoning.get("original_prompt") or reasoning.get("query") or f"Trip to {db_obj.destination}"

        return ItineraryListItem(
            id=db_obj.uuid,
            destination=db_obj.destination,
            title=clean_title,
            original_prompt=prompt_text,
            theme=reasoning.get("theme") or "Heritage & Culture",
            places_count=total_places,
            estimated_distance_km=calc_dist_km,
            travel_dates=db_obj.travel_dates or dates_label,
            budget=db_obj.budget,
            day_count=len(days) if len(days) > 0 else 1,
            created_at=db_obj.created_at.isoformat() if db_obj.created_at else None
        )

itinerary_storage_service = ItineraryStorageService()
