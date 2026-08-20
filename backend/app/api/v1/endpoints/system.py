from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/info", response_model=ResponseModel[dict], summary="Get backend system version info")
async def get_system_info():
    return ResponseModel[dict](
        success=True,
        message="System information retrieved.",
        data={
            "app_name": "Nearby Travel Guide API",
            "environment": "production",
            "backend_version": "2.0.0",
            "api_version": "v1",
            "status": "healthy",
            "db_status": "connected"
        }
    )

@router.get("/legal/privacy-policy", response_model=ResponseModel[dict], summary="Get privacy policy document")
async def get_privacy_policy():
    markdown_content = """# Privacy Policy — Nearby Travel Guide

**Last Updated: August 1, 2026**

## 1. Data Collection
We collect information you provide directly to us when creating an account, editing your profile, or generating AI travel itineraries.

## 2. Location Services
Nearby uses your GPS position to search for nearby tourist attractions, calculate route directions, and provide reverse geocoding. Your location coordinates are never sold or shared with unauthorized third parties.

## 3. Data Protection & Security
We use industry-standard TLS encryption for all network requests and store authentication credentials with secure bcrypt password hashing.

## 4. Your Rights
You may inspect, edit, or request deletion of your account profile at any time through the Account & Security Settings section in the application.
"""
    return ResponseModel[dict](
        success=True,
        message="Privacy policy document retrieved.",
        data={
            "title": "Privacy Policy",
            "last_updated": "2026-08-01",
            "content": markdown_content
        }
    )

@router.get("/legal/terms", response_model=ResponseModel[dict], summary="Get terms & conditions document")
async def get_terms_conditions():
    markdown_content = """# Terms & Conditions — Nearby Travel Guide

**Last Updated: August 1, 2026**

## 1. Acceptance of Terms
By accessing or using the Nearby application, you agree to be bound by these Terms & Conditions.

## 2. Use of Services
Nearby provides AI-driven travel recommendations, itinerary generation, and place exploration. You agree to use the services for lawful personal travel planning purposes only.

## 3. Intellectual Property
All content, branding, UI designs, and AI itinerary models are the intellectual property of Nearby Travel Inc.

## 4. Service Availability
While we strive for 99.9% service uptime, Nearby provides travel recommendations on an "as is" and "as available" basis.
"""
    return ResponseModel[dict](
        success=True,
        message="Terms & conditions document retrieved.",
        data={
            "title": "Terms & Conditions",
            "last_updated": "2026-08-01",
            "content": markdown_content
        }
    )
