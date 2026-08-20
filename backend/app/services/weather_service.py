import httpx
from typing import Dict, Any
from app.core.logging_config import logger
from app.services.geo_service import geo_service

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Open-Meteo Weather WMO Codes Interpretation Map
WMO_WEATHER_MAP: Dict[int, str] = {
    0: "Clear Skies & Sunny",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail"
}


class WeatherService:
    """Live weather forecasting service querying Open-Meteo API (0 API keys required)."""

    async def get_live_weather(
        self,
        latitude: float,
        longitude: float,
        location_name: str = "Current Location"
    ) -> Dict[str, Any]:
        """
        Queries Open-Meteo for real-time weather metrics (temperature, condition, wind speed).
        """
        geo_service.validate(latitude, longitude)

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "current_weather": "true",
                    "hourly": "relativehumidity_2m"
                }
                resp = await client.get(OPEN_METEO_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    curr = data.get("current_weather", {})
                    temp = curr.get("temperature", 26.5)
                    wind = curr.get("windspeed", 12.0)
                    code = curr.get("weathercode", 0)

                    # Extract humidity if hourly available
                    hourly_humidity = data.get("hourly", {}).get("relativehumidity_2m", [65])
                    humidity = hourly_humidity[0] if hourly_humidity else 65

                    condition = WMO_WEATHER_MAP.get(code, "Pleasant & Clear")

                    recommendation = self._build_recommendation(temp, code, location_name)

                    return {
                        "location_name": location_name,
                        "temperature_celsius": float(temp),
                        "condition": condition,
                        "humidity_pct": int(humidity),
                        "rain_probability_pct": 80 if code in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95] else 10,
                        "wind_kmh": float(wind),
                        "weather_code": code,
                        "travel_recommendation": recommendation,
                        "provider": "open-meteo"
                    }
        except Exception as e:
            logger.warning(f"Open-Meteo weather fetch failed: {str(e)}")

        # Fallback Weather structure
        return {
            "location_name": location_name,
            "temperature_celsius": 26.0,
            "condition": "Pleasant Climate",
            "humidity_pct": 65,
            "rain_probability_pct": 15,
            "wind_kmh": 10.0,
            "weather_code": 0,
            "travel_recommendation": f"Ideal weather conditions in {location_name} for outdoor exploration and sightseeing.",
            "provider": "estimate"
        }

    def _build_recommendation(self, temp: float, code: int, location: str) -> str:
        if code in [95, 96, 99]:
            return f"Thunderstorm warning in {location}. Prefer indoor attractions and delay outdoor trekking."
        elif code in [61, 63, 65, 80, 81, 82]:
            return f"Rain expected in {location}. Carry umbrellas and visit covered heritage museums or indoor sights."
        elif temp > 35.0:
            return f"Warm weather in {location} ({temp}°C). Hydrate frequently and prefer morning or evening activities."
        else:
            return f"Excellent weather ({temp}°C, clear) in {location}. Ideal for sightseeing, hiking, and outdoor photography."


weather_service = WeatherService()
