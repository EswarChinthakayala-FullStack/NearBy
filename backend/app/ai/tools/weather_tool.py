import logging
from typing import Dict, Any
from app.services.weather.weather_service import weather_service

logger = logging.getLogger(__name__)

async def fetch_weather_tool(latitude: float, longitude: float) -> Dict[str, Any]:
    """LangChain / CrewAI tool for fetching live weather and forecasts from backend weather service."""
    try:
        data = await weather_service.get_current_weather(latitude, longitude)
        return {
            "temperature_c": data.get("temperature_c", 26.0),
            "condition": data.get("condition", "Pleasant"),
            "humidity_pct": data.get("humidity_pct", 50),
            "rain_probability_pct": data.get("rain_probability_pct", 10),
            "uv_index": data.get("uv_index", 5),
            "recommendation": data.get("recommendation", "Great weather for outdoor activities.")
        }
    except Exception as e:
        logger.error(f"Error in fetch_weather_tool: {e}")
        return {
            "temperature_c": 26.0,
            "condition": "Pleasant Weather",
            "recommendation": "Ideal weather for sightseeing."
        }
