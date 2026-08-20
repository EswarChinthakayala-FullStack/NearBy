from typing import Optional
from app.models.place import Place

# High quality curated images for major destinations and category defaults
SPECIFIC_PLACE_IMAGES = {
    "india gate": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    "qutub minar": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
    "red fort": "https://images.unsplash.com/photo-1592639296346-560c37a0f711?auto=format&fit=crop&w=800&q=80",
    "lal qila": "https://images.unsplash.com/photo-1592639296346-560c37a0f711?auto=format&fit=crop&w=800&q=80",
    "lotus temple": "https://images.unsplash.com/photo-1565352195259-7fe58514930d?auto=format&fit=crop&w=800&q=80",
    "taj mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    "amer fort": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
    "hawa mahal": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
    "gateway of india": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
}

CATEGORY_FALLBACK_IMAGES = {
    "temple": "https://images.unsplash.com/photo-1565352195259-7fe58514930d?auto=format&fit=crop&w=800&q=80",
    "historical": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    "beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "museum": "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80",
    "park": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    "nature": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    "wildlife": "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80",
    "waterfall": "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    "viewpoint": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "shopping": "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
}

DEFAULT_GLOBAL_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"


def get_place_cover_image(place: Place) -> str:
    """Resolve primary cover image for a place with smart fallback for un-scraped records."""
    if "images" in place.__dict__ and place.images and len(place.images) > 0:
        cover = next((img for img in place.images if getattr(img, "is_cover", False)), place.images[0])
        if cover and getattr(cover, "image_url", None):
            return cover.image_url

    # Check specific place match
    name_lower = place.name.lower() if place.name else ""
    for key, url in SPECIFIC_PLACE_IMAGES.items():
        if key in name_lower:
            return url

    # Check category match
    if "category" in place.__dict__ and place.category and getattr(place.category, "name", None):
        cat_lower = place.category.name.lower()
        for cat_key, url in CATEGORY_FALLBACK_IMAGES.items():
            if cat_key in cat_lower:
                return url

    return DEFAULT_GLOBAL_IMAGE
