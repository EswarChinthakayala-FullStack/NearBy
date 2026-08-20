from typing import List, Optional
from pydantic import BaseModel, Field

class AINearbyRequest(BaseModel):
    """Pydantic v2 validation schema for AI Nearby Search requests."""
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Live GPS latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Live GPS longitude coordinate")
    query: str = Field(..., min_length=2, max_length=500, description="Natural language search query")

class QueryUnderstandingSchema(BaseModel):
    """Schema representing query understanding and contextual metadata."""
    intent: str = Field(..., description="Detected user intent")
    primary_category: str = Field(..., description="Target primary category")
    secondary_categories: List[str] = Field(default_factory=list, description="Secondary related categories")
    weather_context: str = Field("Pleasant Weather", description="Live weather condition context")
    time_context: str = Field("Daytime", description="Time of day context")
    active_agents: List[str] = Field(default_factory=list, description="Active CrewAI agents involved in reasoning")

class RecommendationItemSchema(BaseModel):
    """Schema for individual AI-recommended place with navigation metadata & confidence score."""
    place_uuid: str = Field(..., description="Unique UUID identifier")
    place_name: str = Field(..., description="Display name of the place")
    place_slug: str = Field(..., description="SEO-friendly unique slug for mobile navigation")
    category: str = Field(..., description="Primary category name")
    rating: float = Field(..., description="Average rating out of 5.0")
    distance_km: float = Field(..., description="Geographic distance in kilometers")
    confidence: int = Field(90, ge=1, le=100, description="AI confidence score percentage")
    reason: str = Field(..., description="Mistral AI generated contextual explanation")
    cover_image: str = Field("", description="Public URL of place cover image")
    latitude: float = Field(..., description="GPS latitude coordinate")
    longitude: float = Field(..., description="GPS longitude coordinate")

class RecommendationGroupSchema(BaseModel):
    """Schema for grouped recommendation sections (e.g. Perfect Matches, Highly Recommended)."""
    title: str = Field(..., description="Section title e.g. Perfect Matches")
    items: List[RecommendationItemSchema] = Field(default_factory=list, description="Items in this section")

class AINearbyResponse(BaseModel):
    """Schema for structured enterprise AI Nearby Search response."""
    summary: str = Field(..., description="AI synthesized contextual overview")
    query_understanding: QueryUnderstandingSchema = Field(..., description="Query intent understanding metadata")
    recommendation_groups: List[RecommendationGroupSchema] = Field(default_factory=list, description="Grouped recommendation sections")
    recommendations: List[RecommendationItemSchema] = Field(default_factory=list, description="Flat list of recommendations for backward compatibility")
