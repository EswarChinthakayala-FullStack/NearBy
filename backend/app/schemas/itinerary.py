from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class ItineraryGenerateRequest(BaseModel):
    """Pydantic v2 schema for AI Itinerary Generation request."""
    query: str = Field(..., min_length=2, max_length=500, description="Natural language travel query (e.g. 'Plan a 3-day trip to Mysore')")
    destination: Optional[str] = Field(None, description="Optional explicit destination override")
    days: Optional[int] = Field(None, ge=1, le=14, description="Optional explicit trip duration in days")

class ItineraryActivitySchema(BaseModel):
    """Schema for individual itinerary activity item."""
    time: str = Field(..., description="Suggested activity time (e.g. '09:00 AM')")
    place_slug: str = Field(..., description="SEO slug of destination for Place Detail navigation")
    place_name: str = Field(..., description="Display name of attraction")
    reason: str = Field(..., description="AI personalized reason for inclusion")
    travel_minutes: int = Field(0, description="Estimated travel time from previous activity in minutes")
    estimated_duration: str = Field("2h", description="Estimated visit duration (e.g. '2h')")

class ItineraryDaySchema(BaseModel):
    """Schema for a single day plan in the itinerary."""
    day: int = Field(..., description="Day number (1, 2, 3...)")
    theme: str = Field("Explorer", description="Day theme (e.g. 'Heritage & Palaces')")
    activities: List[ItineraryActivitySchema] = Field(default_factory=list)

class WeatherSummarySchema(BaseModel):
    """Schema for destination weather overview snapshot."""
    temperature_c: float = Field(26.0, description="Current temperature in Celsius")
    condition: str = Field("Clear Sky", description="Weather condition description")
    humidity_pct: int = Field(60, description="Humidity percentage")
    rain_probability_pct: int = Field(10, description="Rain probability percentage")
    recommendation: str = Field("Ideal weather for outdoor sightseeing.", description="AI weather advice")

class ItineraryResponse(BaseModel):
    """Structured response model for AI generated travel itinerary."""
    id: str = Field(..., description="Unique itinerary UUID")
    destination: str = Field(..., description="Destination name")
    title: str = Field(..., description="Itinerary title")
    summary: str = Field(..., description="AI synthesized travel summary overview")
    original_prompt: Optional[str] = Field(None, description="Exact prompt submitted by the user")
    theme: Optional[str] = Field("Cultural", description="Overall trip theme e.g. Heritage, Food, Temple, Nature")
    places_count: int = Field(0, description="Total number of attraction waypoints")
    estimated_distance_km: float = Field(0.0, description="Total estimated travel distance in km")
    travel_dates: Optional[str] = Field(None, description="Suggested travel dates or duration")
    budget: Optional[str] = Field("Moderate", description="Budget tier")
    trip_type: Optional[str] = Field("Leisure", description="Trip category")
    weather_summary: WeatherSummarySchema = Field(default_factory=WeatherSummarySchema)
    travel_tips: List[str] = Field(default_factory=list, description="Local travel recommendations and tips")
    days: List[ItineraryDaySchema] = Field(default_factory=list, description="Day-by-day itinerary schedule")
    created_at: Optional[str] = Field(None, description="ISO timestamp")

class ItineraryListItem(BaseModel):
    """Compact summary item for listing user itineraries."""
    id: str = Field(..., description="Itinerary UUID")
    destination: str
    title: str
    original_prompt: Optional[str] = None
    theme: Optional[str] = "Cultural"
    places_count: int = 0
    estimated_distance_km: float = 0.0
    travel_dates: Optional[str] = None
    budget: Optional[str] = None
    day_count: int = 1
    created_at: Optional[str] = None

class ItineraryUpdateRequest(BaseModel):
    """Schema for updating/renaming an itinerary."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    travel_dates: Optional[str] = Field(None, max_length=100)
    budget: Optional[str] = Field(None, max_length=50)
