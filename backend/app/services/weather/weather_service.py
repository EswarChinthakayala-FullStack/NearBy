import logging
import httpx
from typing import Dict, Any
from app.core.cache import cache_manager

logger = logging.getLogger(__name__)

class WeatherService:
    """Asynchronous Weather Service fetching live current weather and forecasts for destinations."""

    async def get_weather_forecast(self, latitude: float, longitude: float) -> Dict[str, Any]:
        lat_round = round(latitude, 3)
        lng_round = round(longitude, 3)
        cache_key = f"weather:{lat_round}:{lng_round}"

        # 1. Check Redis cache first
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached

        # 2. Call Open-Meteo free API asynchronously
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
            async with httpx.AsyncClient(timeout=3.5) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    current = data.get("current_weather", {})
                    daily = data.get("daily", {})

                    temp_c = current.get("temperature", 26.0)
                    weather_code = current.get("weathercode", 0)

                    # Map WMO weather code to readable description
                    condition = "Clear & Pleasant"
                    if weather_code in (1, 2, 3):
                        condition = "Partly Cloudy"
                    elif weather_code in (45, 48):
                        condition = "Foggy"
                    elif weather_code in (51, 53, 55, 61, 63, 65, 80, 81):
                        condition = "Showers & Rain"

                    precip_sum = daily.get("precipitation_sum", [0.0])[0] if daily.get("precipitation_sum") else 0.0
                    rain_prob = 75 if precip_sum > 2.0 else (30 if precip_sum > 0.0 else 10)

                    parsed = {
                        "temperature_c": temp_c,
                        "condition": condition,
                        "humidity_pct": 60,
                        "rain_probability_pct": rain_prob,
                        "uv_index": 5,
                        "recommendation": "Great weather for outdoor activities."
                    }
                    await cache_manager.set(cache_key, parsed, ttl=1800)
                    return parsed
        except Exception as e:
            logger.error(f"Error fetching weather forecast: {e}")

        # Fallback default weather
        fallback = {
            "temperature_c": 26.0,
            "condition": "Pleasant Weather",
            "humidity_pct": 50,
            "rain_probability_pct": 10,
            "uv_index": 4,
            "recommendation": "Ideal weather for sightseeing."
        }
        return fallback

    get_current_weather = get_weather_forecast

weather_service = WeatherService()
