from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
from app.schemas.common import ResponseModel
from app.services.weather_service import weather_service

router = APIRouter()


class WeatherData(BaseModel):
    city: str
    temperature_celsius: float
    condition: str
    humidity_pct: int
    rain_probability_pct: int
    wind_kmh: float
    travel_recommendation: str


@router.get(
    "/weather",
    response_model=ResponseModel[WeatherData],
    summary="Get live weather information for a travel location",
    description="Returns live/forecasted Open-Meteo weather data and travel recommendations for specified coordinates or city."
)
async def get_weather(
    city: str = Query("Current Location", description="Destination city name"),
    latitude: Optional[float] = Query(None, description="Latitude coordinate"),
    longitude: Optional[float] = Query(None, description="Longitude coordinate")
):
    lat = latitude if latitude is not None else 15.4909
    lng = longitude if longitude is not None else 73.8278

    w_data = await weather_service.get_live_weather(lat, lng, location_name=city)

    data = WeatherData(
        city=w_data.get("location_name", city),
        temperature_celsius=w_data.get("temperature_celsius", 26.0),
        condition=w_data.get("condition", "Clear"),
        humidity_pct=w_data.get("humidity_pct", 65),
        rain_probability_pct=w_data.get("rain_probability_pct", 10),
        wind_kmh=w_data.get("wind_kmh", 12.0),
        travel_recommendation=w_data.get("travel_recommendation", f"Great weather in {city}.")
    )

    return ResponseModel[WeatherData](
        success=True,
        message=f"Live weather details for {city} retrieved successfully via Open-Meteo.",
        data=data
    )
