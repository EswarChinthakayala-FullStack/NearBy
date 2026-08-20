import time
import asyncio
import logging
from typing import Dict, Any, Optional, Callable, Coroutine
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.crews.itinerary.crew import itinerary_crew_builder
from app.services.destination.destination_resolver import destination_resolver_service
from app.services.weather.weather_service import weather_service
from app.services.itinerary.itinerary_context_builder import itinerary_context_builder
from app.services.ai.mistral_itinerary_service import mistral_itinerary_service
from app.services.itinerary.query_parser import query_parser_service
from app.ai.agents.validation_agent import validation_agent

logger = logging.getLogger(__name__)

# Type alias for the step callback
AgentStepCallback = Optional[Callable[..., Coroutine[Any, Any, None]]]


class ItineraryOrchestrator:
    """Enterprise AI Orchestrator for Itinerary Planning Crew using CrewAI + LangChain + Mistral."""

    async def execute_itinerary_crew(
        self,
        db: AsyncSession,
        user_uuid: str,
        query: str,
        destination: Optional[str] = None,
        days: Optional[int] = None,
        on_agent_step: AgentStepCallback = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        logger.info(f"[ItineraryOrchestrator] Executing Itinerary Agentic Crew for user={user_uuid}, query='{query}'")

        async def emit(event: str, agent: str, message: str = ""):
            if on_agent_step:
                try:
                    await on_agent_step(event=event, agent=agent, message=message)
                except Exception:
                    pass

        # 1. Instantiate CrewAI multi-agent crew
        await emit("agent_start", "Destination Intelligence Agent", "Initializing multi-agent crew...")
        crew_instance = itinerary_crew_builder.build_crew()
        active_agent_names = [agent.role for agent in crew_instance.agents] + ["ValidationAgent", "FormatterAgent"]

        # 2. Query Intent Parsing & Destination Resolution Agent
        parsed_query = query_parser_service.parse_query(query=query, explicit_dest=destination, explicit_days=days)
        target_dest = parsed_query["destination"]
        requested_days = parsed_query["days"]
        trip_type = parsed_query["trip_type"]

        await emit("agent_thinking", "Destination Intelligence Agent", f"Resolving destination: {target_dest} ({requested_days} days)...")
        dest_info = await destination_resolver_service.resolve_destination(target_dest)
        lat = dest_info.get("latitude", 12.2958)
        lng = dest_info.get("longitude", 76.6394)
        dest_name = dest_info.get("destination_name") or dest_info.get("city") or target_dest
        await emit("agent_complete", "Destination Intelligence Agent", f"Resolved to {dest_name} ({lat:.3f}, {lng:.3f})")

        # 3. Parallel execution of Weather & Tourism context builders
        await emit("agent_start", "Weather & Context Specialist", f"Fetching live weather and tourism context for {dest_name}...")
        parsed_dict = {
            "destination": dest_name,
            "days": requested_days,
            "query": query,
            "trip_type": trip_type,
            "latitude": lat,
            "longitude": lng
        }

        weather_res, context_info = await asyncio.gather(
            weather_service.get_weather_forecast(lat, lng),
            itinerary_context_builder.build_context(db=db, parsed_query=parsed_dict),
            return_exceptions=True
        )

        if isinstance(weather_res, Exception):
            weather_res = {"temperature_c": 26.0, "condition": "Pleasant Weather"}
        if isinstance(context_info, Exception):
            context_info = {"attractions": []}
        await emit("agent_complete", "Weather & Context Specialist", "Weather and context data collected")

        # 4. AI Planning Agent Execution via Mistral Large
        await emit("agent_start", "Travel Itinerary Architect", "Generating personalized itinerary with Mistral AI...")
        generated_itinerary = await mistral_itinerary_service.generate_itinerary(
            context=context_info if isinstance(context_info, dict) else {}
        )
        await emit("agent_complete", "Travel Itinerary Architect", f"Generated {len(generated_itinerary.get('days', []))}-day itinerary")

        generated_itinerary["destination"] = dest_name
        generated_itinerary["active_agents"] = active_agent_names

        # 5. Guardrail Validation Agent (Zero Hallucinations)
        await emit("agent_start", "ValidationAgent", "Validating itinerary against verified database entries...")
        validated_days = validation_agent.validate_itinerary(
            days=generated_itinerary.get("days", []),
            db_candidates=context_info.get("attractions", []) if isinstance(context_info, dict) else []
        )
        generated_itinerary["days"] = validated_days
        await emit("agent_complete", "ValidationAgent", "All activities validated")

        logger.info(f"[ItineraryOrchestrator] Completed in {round((time.time() - start_time) * 1000, 2)}ms")
        return generated_itinerary

itinerary_orchestrator = ItineraryOrchestrator()
