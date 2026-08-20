import logging
from typing import Dict, Any, List
from crewai import Agent, Crew, Process, Task
from app.langchain.llm_provider import llm_provider
from app.tools.weather_tool import WeatherTool
from app.tools.geocoder_tool import ReverseGeocodeTool

logger = logging.getLogger(__name__)

class NearbyCrewBuilder:
    """CrewAI Builder for AI Nearby Search Agentic Crew."""

    def build_crew(self) -> Crew:
        llm = llm_provider.get_llm()

        # 1. Query Understanding Agent
        query_agent = Agent(
            role="Query Intent Specialist",
            goal="Analyze natural language queries and extract primary & excluded tourism categories.",
            backstory="Senior NLP Engineer expert in semantic tourism intent classification.",
            verbose=False,
            allow_delegation=False,
            llm=llm
        )

        # 2. Location & Weather Context Agent
        context_agent = Agent(
            role="Geospatial & Weather Specialist",
            goal="Gather precise location hierarchy and live weather advisories for GPS coordinates.",
            backstory="Geospatial Analyst expert in weather-sensitive travel recommendations.",
            verbose=False,
            allow_delegation=False,
            tools=[WeatherTool(), ReverseGeocodeTool()],
            llm=llm
        )

        # 3. Ranking & Explanation Agent
        ranking_agent = Agent(
            role="Tourism Recommendation Architect",
            goal="Rank attractions by intent relevance, quality, and weather feasibility without hallucinating.",
            backstory="Principal Travel Recommendation Architect designing personalized tourism plans.",
            verbose=False,
            allow_delegation=False,
            llm=llm
        )

        task_intent = Task(
            description="Analyze query intent and category exclusions.",
            expected_output="Structured JSON intent summary.",
            agent=query_agent
        )

        task_context = Task(
            description="Gather weather and location context.",
            expected_output="Location and weather metadata.",
            agent=context_agent
        )

        task_rank = Task(
            description="Synthesize final recommendations.",
            expected_output="Ranked recommendation groups.",
            agent=ranking_agent
        )

        return Crew(
            agents=[query_agent, context_agent, ranking_agent],
            tasks=[task_intent, task_context, task_rank],
            process=Process.sequential
        )

nearby_crew_builder = NearbyCrewBuilder()
