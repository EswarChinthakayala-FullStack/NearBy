import logging
from typing import Dict, Any, List
from crewai import Agent, Crew, Process, Task
from app.langchain.llm_provider import llm_provider
from app.tools.weather_tool import WeatherTool
from app.tools.geocoder_tool import ReverseGeocodeTool
from app.tools.routing_tool import OSRMTool

logger = logging.getLogger(__name__)

class ItineraryCrewBuilder:
    """CrewAI Builder for AI Smart Itinerary Planning Agentic Crew."""

    def build_crew(self) -> Crew:
        llm = llm_provider.get_llm()

        # 1. Intent & Destination Agent
        intent_agent = Agent(
            role="Travel Intent & Destination Resolver",
            goal="Resolve destination coordinates, requested days, and user travel preferences.",
            backstory="Expert Travel Concierge specializing in destination analysis.",
            verbose=False,
            allow_delegation=False,
            tools=[ReverseGeocodeTool()],
            llm=llm
        )

        # 2. Weather & Route Planning Agent
        logistics_agent = Agent(
            role="Logistics & Weather Specialist",
            goal="Analyze daily weather forecasts and driving times between attraction stops.",
            backstory="Logistics Specialist optimizing travel schedules and weather safety.",
            verbose=False,
            allow_delegation=False,
            tools=[WeatherTool(), OSRMTool()],
            llm=llm
        )

        # 3. AI Itinerary Planning Agent
        planner_agent = Agent(
            role="Master Itinerary Architect",
            goal="Synthesize day-by-day travel schedules, day themes, and activity times.",
            backstory="Principal Travel Planner building personalized travel itineraries.",
            verbose=False,
            allow_delegation=False,
            llm=llm
        )

        task_intent = Task(
            description="Extract destination, duration, and preferences.",
            expected_output="Destination and preference summary.",
            agent=intent_agent
        )

        task_logistics = Task(
            description="Gather weather and compute OSRM driving routes.",
            expected_output="Weather and route logistics summary.",
            agent=logistics_agent
        )

        task_plan = Task(
            description="Generate complete day-by-day itinerary.",
            expected_output="Structured day-by-day itinerary JSON.",
            agent=planner_agent
        )

        return Crew(
            agents=[intent_agent, logistics_agent, planner_agent],
            tasks=[task_intent, task_logistics, task_plan],
            process=Process.sequential
        )

itinerary_crew_builder = ItineraryCrewBuilder()
