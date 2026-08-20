import re
import unicodedata
from typing import Callable, Optional


def generate_slug(text: str) -> str:
    """Generate an SEO-friendly, URL-safe slug from input string."""
    if not text:
        return ""

    # Normalize unicode characters e.g. Śrī -> Sri
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")

    # Lowercase & strip spaces
    lowered = ascii_text.lower().strip()

    # Replace special characters and non-alphanumeric chars with hyphens
    cleaned = re.sub(r"[^\w\s-]", "", lowered)
    slug = re.sub(r"[-\s]+", "-", cleaned).strip("-")

    return slug


def generate_unique_slug(
    text: str,
    exists_fn: Callable[[str], bool]
) -> str:
    """Generate a unique slug appending numeric suffixes if slug already exists."""
    base_slug = generate_slug(text) or "item"

    if not exists_fn(base_slug):
        return base_slug

    counter = 2
    while True:
        candidate_slug = f"{base_slug}-{counter}"
        if not exists_fn(candidate_slug):
            return candidate_slug
        counter += 1
