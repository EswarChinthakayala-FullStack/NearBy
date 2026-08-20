import asyncio
from typing import Type, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.tools import BaseTool
from app.services.destination.destination_resolver import destination_resolver_service

class GeocodeInput(BaseModel):
    destination: str = Field(..., description="City or region name to resolve")

class ReverseGeocodeTool(BaseTool):
    name: str = "reverse_geocode_tool"
    description: str = "Resolves destination names into exact GPS coordinates and administrative hierarchy."
    args_schema: Type[BaseModel] = GeocodeInput

    def _run(self, destination: str) -> Dict[str, Any]:
        return asyncio.run(destination_resolver_service.resolve_destination(destination))

    async def _arun(self, destination: str) -> Dict[str, Any]:
        return await destination_resolver_service.resolve_destination(destination)
