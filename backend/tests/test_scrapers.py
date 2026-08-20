import pytest
from app.scrapers.bing_image_scraper import bing_image_scraper
from app.scrapers.wikimedia_fetcher import wikimedia_fetcher


@pytest.mark.asyncio
async def test_wikimedia_fetcher_structure():
    """Verify Wikimedia fetcher output normalization format."""
    results = await wikimedia_fetcher.fetch_images(query="Taj Mahal", limit=2)
    assert isinstance(results, list)
    for item in results:
        assert "image_url" in item
        assert "thumbnail_url" in item
        assert item["source"] == "wikimedia"
        assert "attribution" in item


@pytest.mark.asyncio
async def test_bing_scraper_caching_and_structure():
    """Verify Bing image scraper in-memory caching and response structure."""
    results1 = await bing_image_scraper.fetch_images(query="Red Fort Delhi", limit=2)
    assert isinstance(results1, list)

    # Second call should hit in-memory cache
    results2 = await bing_image_scraper.fetch_images(query="Red Fort Delhi", limit=2)
    assert results1 == results2
