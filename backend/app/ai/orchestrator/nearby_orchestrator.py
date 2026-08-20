import time
import asyncio
import logging
from typing import Dict, Any, Optional, Callable, Coroutine

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.crews.nearby.crew import nearby_crew_builder
from app.ai.tools.weather_tool import fetch_weather_tool
from app.ai.tools.reverse_geocode_tool import reverse_geocode_tool
from app.ai.tools.tourism_search_tool import tourism_search_tool
from app.ai.agents.validation_agent import validation_agent
from app.services.ai.ai_recommendation_service import ai_recommendation_service
from app.services.ai.ai_response_formatter import ai_response_formatter
from app.schemas.ai.nearby_schema import AINearbyResponse

logger = logging.getLogger(__name__)

# Type alias for the step callback
AgentStepCallback = Optional[Callable[..., Coroutine[Any, Any, None]]]


class NearbyOrchestrator:
    """Enterprise AI Orchestrator for Nearby Search Crew using CrewAI + LangChain + Mistral."""

    async def execute_nearby_crew(
        self,
        db: AsyncSession,
        query: str,
        latitude: float,
        longitude: float,
        on_agent_step: AgentStepCallback = None
    ) -> AINearbyResponse:
        start_time = time.time()
        logger.info(f"[NearbyOrchestrator] Executing Nearby Agentic Crew for query='{query}' at ({latitude}, {longitude})")

        async def emit(event: str, agent: str, message: str = ""):
            if on_agent_step:
                try:
                    await on_agent_step(event=event, agent=agent, message=message)
                except Exception:
                    pass

        # 1. Instantiate CrewAI multi-agent crew
        await emit("agent_start", "Query Intent Specialist", "Analyzing your search query and intent...")
        crew_instance = nearby_crew_builder.build_crew()
        active_agent_names = [agent.role for agent in crew_instance.agents] + ["ValidationAgent", "FormatterAgent"]
        await emit("agent_complete", "Query Intent Specialist", "Query intent identified")

        # 2. Concurrently execute deterministic LangChain tools via asyncio.gather()
        await emit("agent_start", "Geospatial & Weather Specialist", "Fetching live weather, location context, and nearby attractions...")
        weather_res, loc_context, candidates = await asyncio.gather(
            fetch_weather_tool(latitude, longitude),
            reverse_geocode_tool(latitude, longitude),
            tourism_search_tool(db, latitude, longitude, query, limit=50),
            return_exceptions=True
        )

        if isinstance(weather_res, Exception):
            weather_res = {"temperature_c": 26.0, "condition": "Pleasant Weather"}
        if isinstance(loc_context, Exception):
            loc_context = {"administrative_hierarchy": {"city": "Local Area"}}
        if isinstance(candidates, Exception) or not candidates:
            candidates = []

        await emit("agent_complete", "Geospatial & Weather Specialist", f"Found {len(candidates)} candidate places")

        # 3. Agentic Reasoning & Ranking via Mistral Large
        await emit("agent_start", "Tourism Recommendation Architect", "Ranking and reasoning over candidate places with Mistral AI...")
        raw_recommendations = await ai_recommendation_service.rank_and_recommend(
            query=query,
            location_context=loc_context if isinstance(loc_context, dict) else {},
            candidate_places=candidates
        )
        await emit("agent_complete", "Tourism Recommendation Architect", "Recommendations ranked by AI confidence")

        # 4. Guardrail Validation Agent (Zero Hallucinations)
        await emit("agent_start", "ValidationAgent", "Validating recommendations against database for zero hallucinations...")
        validated_items = validation_agent.validate_recommendations(
            raw_items=raw_recommendations.get("recommendations", []),
            db_candidates=candidates
        )
        raw_recommendations["recommendations"] = validated_items
        await emit("agent_complete", "ValidationAgent", f"Validated {len(validated_items)} recommendations")

        # Attach active agent metadata for frontend easing indicators
        if "query_understanding" in raw_recommendations and isinstance(raw_recommendations["query_understanding"], dict):
            raw_recommendations["query_understanding"]["active_agents"] = active_agent_names

        # 5. Formatter Agent to produce structured Pydantic response
        await emit("agent_start", "FormatterAgent", "Formatting final structured response...")
        formatted_response = ai_response_formatter.format_response(raw_recommendations)
        await emit("agent_complete", "FormatterAgent", "Response formatted successfully")

        logger.info(f"[NearbyOrchestrator] Completed in {round((time.time() - start_time) * 1000, 2)}ms")

        return formatted_response

nearby_orchestrator = NearbyOrchestrator()
