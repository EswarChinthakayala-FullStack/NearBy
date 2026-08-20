from typing import Dict, Any, List, Optional
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.place import Place
from app.services.geo_service import geo_service
from app.services.location_service import location_service
from app.services.weather_service import weather_service
from app.utils.image_helpers import get_place_cover_image


class AIContextBuilder:
    """Production location intelligence builder synthesizing real GPS, reverse geocoding, Open-Meteo, DB places, and OSM POIs."""

    async def build_context(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        radius_km: float = 15.0,
        query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes real GPS coordinates, Reverse Geocoded address, Open-Meteo live weather,
        and nearby DB + OSM POIs into a complete context object.
        """
        geo_service.validate(latitude, longitude)

        # 1. Reverse Geocode Coordinates
        loc_data = await location_service.reverse_geocode(latitude, longitude)
        city = loc_data.get("city") or "Local Region"
        district = loc_data.get("district") or city
        state = loc_data.get("state") or ""

        # 2. Fetch Live Weather from Open-Meteo
        weather_data = await weather_service.get_live_weather(latitude, longitude, location_name=loc_data.get("location_name", city))

        # 3. Query Database Places within bounding box / radius
        min_lat, min_lng, max_lat, max_lng = geo_service.bounding_box(latitude, longitude, radius_km)
        
        stmt = (
            select(Place)
            .options(selectinload(Place.category), selectinload(Place.images))
            .where(Place.status == "published")
            .where(Place.latitude.between(min_lat, max_lat))
            .where(Place.longitude.between(min_lng, max_lng))
        )

        if query and query.strip():
            q_clean = query.strip()
            stmt = stmt.where(
                or_(
                    Place.name.ilike(f"%{q_clean}%"),
                    Place.description.ilike(f"%{q_clean}%"),
                    Place.city.ilike(f"%{q_clean}%")
                )
            )

        res = await db.execute(stmt)
        db_places = list(res.scalars().all())

        db_place_items = []
        for p in db_places:
            dist = geo_service.distance(latitude, longitude, float(p.latitude), float(p.longitude))
            if dist <= radius_km:
                cover_url = get_place_cover_image(p)
                db_place_items.append({
                    "uuid": p.uuid,
                    "name": p.name,
                    "slug": p.slug,
                    "city": p.city,
                    "latitude": float(p.latitude),
                    "longitude": float(p.longitude),
                    "distance_km": dist,
                    "rating": float(p.avg_rating),
                    "category": p.category.name if p.category else "Attraction",
                    "cover_image_url": cover_url,
                    "source": "database"
                })

        db_place_items.sort(key=lambda x: x["distance_km"])

        # 4. Query OpenStreetMap Overpass POIs via destination_spots_service if database results are sparse
        osm_pois = []
        if len(db_place_items) < 5:
            try:
                from app.services.destination_spots_service import destination_spots_service
                spots_by_cat = await destination_spots_service.fetch_spots(
                    destination=city,
                    limit_per_category=4,
                    lat=latitude,
                    lon=longitude
                )
                for cat_name, spot_list in spots_by_cat.items():
                    for spot in spot_list:
                        slat = spot.get("lat")
                        slon = spot.get("lon")
                        dist = geo_service.distance(latitude, longitude, slat, slon) if (slat and slon) else 5.0
                        osm_pois.append({
                            "uuid": f"osm-{hash(spot.get('name'))}",
                            "name": spot.get("name"),
                            "slug": spot.get("name", "").lower().replace(" ", "-"),
                            "category": cat_name.title(),
                            "city": city,
                            "latitude": slat or latitude,
                            "longitude": slon or longitude,
                            "distance_km": dist,
                            "avg_rating": 4.5,
                            "total_reviews": 12,
                            "total_favorites": 5,
                            "tag": spot.get("tag"),
                            "wikipedia": spot.get("wikipedia"),
                            "source": "osm_spots"
                        })
            except Exception:
                pass

        # 5. Synthesize Combined POI Candidates
        combined_places = db_place_items + osm_pois

        return {
            "current_location": loc_data,
            "weather": weather_data,
            "radius_km": radius_km,
            "db_places_count": len(db_place_items),
            "osm_pois_count": len(osm_pois),
            "db_places": db_place_items,
            "osm_pois": osm_pois,
            "combined_places": combined_places[:12]
        }


ai_context_builder = AIContextBuilder()
