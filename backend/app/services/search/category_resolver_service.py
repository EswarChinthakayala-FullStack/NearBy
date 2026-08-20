import logging
from typing import List, Set

logger = logging.getLogger(__name__)

CATEGORY_ALIASES = {
    "temple": ["temple", "temples", "shrine", "mandir", "religious place", "spiritual center", "sanctuary"],
    "waterfall": ["waterfall", "waterfalls", "falls", "cascade"],
    "restaurant": ["restaurant", "restaurants", "diner", "bistro", "eatery", "food court", "fine dining"],
    "cafe": ["cafe", "cafes", "coffee shop", "bakery", "coffee house"],
    "museum": ["museum", "museums", "art gallery", "exhibition center", "gallery"],
    "fort": ["fort", "forts", "palace", "citadel", "heritage monument"],
    "park": ["park", "parks", "garden", "gardens", "botanical garden", "nature reserve"],
    "beach": ["beach", "beaches", "seashore", "coast"]
}

class CategoryResolverService:
    """Semantic Category Resolver for mapping natural queries to DB category synonyms & exclusions."""

    def resolve_categories(self, primary_category: str) -> List[str]:
        cat_lower = primary_category.lower().strip()
        matched = CATEGORY_ALIASES.get(cat_lower, [primary_category])
        return matched

    def is_excluded(self, item_category: str, excluded_categories: List[str]) -> bool:
        if not excluded_categories:
            return False
        cat_lower = item_category.lower()
        for excl in excluded_categories:
            if excl.lower() in cat_lower or cat_lower in excl.lower():
                return True
        return False

category_resolver_service = CategoryResolverService()
