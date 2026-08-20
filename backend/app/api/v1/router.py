from fastapi import APIRouter
from app.api.v1.endpoints import (
    admin,
    ai,
    auth,
    categories,
    directions,
    favorites,
    home,
    image_search,
    itinerary,
    location,
    nearby,
    notifications,
    places,
    reviews,
    system,
    uploads,
    users,
    weather,
    ws_ai,
    explore,
)

api_router = APIRouter()

# Register V1 Endpoints Sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(location.router, prefix="/location", tags=["Location Intelligence"])
api_router.include_router(nearby.router, prefix="/places", tags=["Nearby Spatial Search"])
api_router.include_router(places.router, prefix="/places", tags=["Tourist Places"])
api_router.include_router(directions.router, prefix="/directions", tags=["Directions & Routing"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews & Ratings"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
api_router.include_router(favorites.router, prefix="/me/favorites", tags=["Favorites"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications & Alerts"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["File Uploads"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Operations"])
api_router.include_router(image_search.router, prefix="/images", tags=["Keyless Image Search"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Neural Engine"])
api_router.include_router(weather.router, prefix="/weather", tags=["Destination Weather"])
api_router.include_router(itinerary.router, prefix="/itinerary", tags=["AI Smart Itinerary Engine"])
api_router.include_router(itinerary.router, prefix="/ai/itinerary", tags=["AI Smart Itinerary Engine"])
api_router.include_router(ws_ai.router, prefix="/ws", tags=["WebSocket AI Streaming"])
api_router.include_router(home.router, prefix="/home", tags=["Home Dashboard"])
api_router.include_router(system.router, prefix="/system", tags=["System Information"])
api_router.include_router(system.router, prefix="", tags=["Legal Documents"])
api_router.include_router(explore.router, prefix="/explore", tags=["Universal Explore Search"])

