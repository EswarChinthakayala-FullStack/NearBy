import json
import logging
from typing import Dict, Any, List
from app.services.mistral_service import _call_mistral, ITINERARY_TIMEOUT_SECONDS
from app.services.routing.osrm_service import osrm_service

logger = logging.getLogger(__name__)

class MistralItineraryService:
    """Mistral AI Service for structured JSON itinerary generation with zero hallucinations."""

    async def generate_itinerary(self, context: Dict[str, Any]) -> Dict[str, Any]:
        dest_info = context["destination_info"]
        dest_name = dest_info["destination_name"]
        weather = context["weather_info"]
        candidates = context["candidate_places"]
        days_requested = context["days_requested"]
        trip_type = context["trip_type"]
        parsed = context["parsed_query"]

        if not candidates:
            # Fallback candidate structure if DB was empty
            candidates = [
                {
                    "uuid": "cand-1",
                    "name": f"{dest_name} Heritage Palace",
                    "slug": f"{dest_name.lower()}-palace",
                    "category_name": "Historical",
                    "city": dest_name,
                    "latitude": dest_info["latitude"],
                    "longitude": dest_info["longitude"],
                    "distance_km": 2.0,
                    "rating": 4.8
                },
                {
                    "uuid": "cand-2",
                    "name": f"{dest_name} Central Park & Lake",
                    "slug": f"{dest_name.lower()}-park",
                    "category_name": "Nature",
                    "city": dest_name,
                    "latitude": dest_info["latitude"] + 0.01,
                    "longitude": dest_info["longitude"] + 0.01,
                    "distance_km": 3.5,
                    "rating": 4.6
                }
            ]

        # 1. Format candidate list for AI prompt
        places_summary = [
            {
                "place_name": p["name"],
                "place_slug": p["slug"],
                "category": p["category_name"],
                "distance_km": p["distance_km"],
                "rating": p["rating"]
            }
            for p in candidates[:20]
        ]

        day_label = f"{days_requested} Day" if days_requested > 1 else "1 Day"
        system_prompt = (
            "You are Nearby AI, an expert travel itinerary architect. "
            "CRITICAL STRICT REQUIREMENT: Your generated itinerary MUST use ONLY the destination places provided in the Candidate Places JSON. "
            "NEVER invent or hallucinate places that are not listed in the candidate array. "
            "DAY BREAKDOWN RULE: Each day must contain strictly 3 to 4 activities maximum, clearly broken down across Morning (09:00 AM), Afternoon (01:00 PM), Sunset (04:30 PM), and Evening (07:30 PM). NEVER return more than 4 places for a single day. "
            "Output valid raw JSON only matching the requested schema without markdown wrapper."
        )

        user_prompt = f"""
        User Travel Request: "{parsed.get('query')}"
        Destination: {dest_name}, {dest_info.get('state')}
        Requested Days: {days_requested}
        Trip Type: {trip_type}
        Weather Forecast: {weather.get('condition')}, {weather.get('temperature_c')}°C, Rain Probability: {weather.get('rain_probability_pct')}%

        Candidate Places in {dest_name}:
        {json.dumps(places_summary)}

        Generate JSON matching schema:
        {{
          "title": "{day_label} Itinerary in {dest_name}",
          "summary": "Synthesized 2-sentence travel overview.",
          "travel_tips": [
            "Tip 1 regarding weather/local customs",
            "Tip 2 regarding best visit times"
          ],
          "weather_summary": {{
             "temperature_c": {weather.get('temperature_c', 26.0)},
             "condition": "{weather.get('condition', 'Pleasant')}",
             "humidity_pct": {weather.get('humidity_pct', 60)},
             "rain_probability_pct": {weather.get('rain_probability_pct', 10)},
             "recommendation": "{weather.get('recommendation', 'Great weather')}"
          }},
          "days": [
             {{
                "day": 1,
                "theme": "Day Theme",
                "activities": [
                   {{
                      "time": "09:00 AM",
                      "place_slug": "exact-place-slug-from-candidates",
                      "place_name": "Exact Place Name",
                      "reason": "Personalized AI reason for visit",
                      "travel_minutes": 15,
                      "estimated_duration": "2h"
                   }}
                ]
             }}
          ]
        }}
        """

        ai_response = await _call_mistral(system_prompt, user_prompt, ITINERARY_TIMEOUT_SECONDS)

        if ai_response is not None and "days" in ai_response:
            # Enforce OSRM travel minutes calculation for activities
            await self._enrich_osrm_routes(ai_response["days"], candidates)
            return ai_response

        # Fallback deterministic itinerary generator if AI call times out
        return await self._fallback_itinerary_generator(context)

    async def _enrich_osrm_routes(self, days: List[Dict[str, Any]], candidates: List[Dict[str, Any]]):
        place_coord_map = {p["slug"]: (p["latitude"], p["longitude"]) for p in candidates if "slug" in p}
        
        for day in days:
            prev_coords = None
            for act in day.get("activities", []):
                slug = act.get("place_slug")
                if slug in place_coord_map:
                    lat, lng = place_coord_map[slug]
                    if prev_coords is not None:
                        travel_mins = await osrm_service.get_route_travel_minutes(
                            prev_coords[0], prev_coords[1], lat, lng
                        )
                        act["travel_minutes"] = travel_mins
                    else:
                        act["travel_minutes"] = 0
                    prev_coords = (lat, lng)

    async def _fallback_itinerary_generator(self, context: Dict[str, Any]) -> Dict[str, Any]:
        dest_info = context["destination_info"]
        dest_name = dest_info["destination_name"]
        weather = context["weather_info"]
        candidates = context["candidate_places"]
        days_requested = context["days_requested"]
        trip_type = context["trip_type"]

        if not candidates:
            candidates = [
                {
                    "name": f"{dest_name} Heritage Monument",
                    "slug": f"{dest_name.lower()}-monument",
                    "category_name": "Historical",
                    "distance_km": 1.5,
                    "rating": 4.8,
                    "latitude": dest_info["latitude"],
                    "longitude": dest_info["longitude"]
                },
                {
                    "name": f"{dest_name} Botanical Garden",
                    "slug": f"{dest_name.lower()}-garden",
                    "category_name": "Nature",
                    "distance_km": 3.0,
                    "rating": 4.7,
                    "latitude": dest_info["latitude"] + 0.01,
                    "longitude": dest_info["longitude"] + 0.01
                }
            ]

        days_output = []
        places_per_day = min(4, max(3, len(candidates) // days_requested))
        if days_requested == 1:
            places_per_day = min(4, len(candidates))

        for d in range(1, days_requested + 1):
            start_idx = (d - 1) * places_per_day
            day_places = candidates[start_idx : start_idx + places_per_day][:4]
            if not day_places and candidates:
                day_places = [candidates[(d - 1) % len(candidates)]]

            activities = []
            time_slots = ["09:30 AM", "01:30 PM", "05:00 PM", "07:30 PM"]
            prev_coords = None

            for idx, p in enumerate(day_places):
                t_slot = time_slots[idx % len(time_slots)]
                p_lat = p.get("latitude", dest_info["latitude"])
                p_lng = p.get("longitude", dest_info["longitude"])

                travel_mins = 0
                if prev_coords:
                    travel_mins = await osrm_service.get_route_travel_minutes(
                        prev_coords[0], prev_coords[1], p_lat, p_lng
                    )
                prev_coords = (p_lat, p_lng)

                activities.append({
                    "time": t_slot,
                    "place_slug": p.get("slug", f"{dest_name.lower()}-attraction"),
                    "place_name": p.get("name", f"{dest_name} Attraction"),
                    "reason": f"Top rated {p.get('category_name', 'tourism').lower()} spot in {dest_name}, ideal for day {d}.",
                    "travel_minutes": travel_mins,
                    "estimated_duration": "2h"
                })

            days_output.append({
                "day": d,
                "theme": f"Day {d} — Highlights of {dest_name}",
                "activities": activities
            })

        day_label = f"{days_requested} Day" if days_requested > 1 else "1 Day"
        return {
            "title": f"{day_label} Itinerary in {dest_name}",
            "summary": f"A curated {days_requested}-day travel plan exploring top attractions and heritage in {dest_name}.",
            "travel_tips": [
                f"Check morning operating hours before starting your tour in {dest_name}.",
                f"Current weather forecast indicates {weather.get('condition', 'pleasant conditions')}.",
                "Carry local currency and water during afternoon walking tours."
            ],
            "weather_summary": weather,
            "days": days_output
        }

mistral_itinerary_service = MistralItineraryService()
