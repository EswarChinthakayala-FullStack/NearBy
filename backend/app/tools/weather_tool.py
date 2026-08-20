import asyncio
from typing import Type, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.tools import BaseTool
from app.services.weather.weather_service import weather_service

class WeatherInput(BaseModel):
    latitude: float = Field(..., description="GPS latitude coordinate")
    longitude: float = Field(..., description="GPS longitude coordinate")

class WeatherTool(BaseTool):
    name: str = "weather_tool"
    description: str = "Fetch live weather forecast and advisories for GPS coordinates."
    args_schema: Type[BaseModel] = WeatherInput

    def _run(self, latitude: float, longitude: float) -> Dict[str, Any]:
        return asyncio.run(weather_service.get_weather_forecast(latitude, longitude))

    async def _arun(self, latitude: float, longitude: float) -> Dict[str, Any]:
        return await weather_service.get_weather_forecast(latitude, longitude)
