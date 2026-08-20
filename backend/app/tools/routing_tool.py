import asyncio
from typing import Type, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.tools import BaseTool
from app.services.routing.osrm_service import osrm_service

class RouteInput(BaseModel):
    origin_lat: float = Field(..., description="Origin GPS latitude")
    origin_lng: float = Field(..., description="Origin GPS longitude")
    dest_lat: float = Field(..., description="Destination GPS latitude")
    dest_lng: float = Field(..., description="Destination GPS longitude")

class OSRMTool(BaseTool):
    name: str = "osrm_tool"
    description: str = "Calculates driving distance and travel duration between GPS coordinates using OSRM."
    args_schema: Type[BaseModel] = RouteInput

    def _run(self, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> Dict[str, Any]:
        return asyncio.run(osrm_service.get_route(waypoints=[(origin_lat, origin_lng), (dest_lat, dest_lng)]))

    async def _arun(self, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> Dict[str, Any]:
        return await osrm_service.get_route(waypoints=[(origin_lat, origin_lng), (dest_lat, dest_lng)])
