import re


def slugify(text: str) -> str:
    """Generate a clean URL-safe slug from a string."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)
