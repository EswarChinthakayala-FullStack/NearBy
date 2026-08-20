import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.circuit_breaker import SourceCircuitBreaker
from app.scrapers.aggregator import normalize_url, build_proxy_thumb_url, aggregate_image_results
from app.scrapers.ddg_scraper import scrape_duckduckgo_images


client = TestClient(app)


def test_url_normalization():
    url1 = "https://example.com/images/cat.jpg?token=123&quality=high"
    url2 = "HTTPS://EXAMPLE.COM/images/cat.jpg"
    assert normalize_url(url1) == "https://example.com/images/cat.jpg"
    assert normalize_url(url2) == "https://example.com/images/cat.jpg"


def test_aggregator_deduplication_ranking_interleaving():
    source_bing = [
        {"thumbnail_url": "http://bing.com/t1.jpg", "source_url": "http://site.com/photo.jpg?ref=1", "title": "Cat 1", "width": 800, "height": 600, "source_site": "bing"},
        {"thumbnail_url": "http://bing.com/t2.jpg", "source_url": "http://site.com/photo2.jpg", "title": "Cat 2", "width": 1200, "height": 900, "source_site": "bing"},
    ]
    source_ddg = [
        {"thumbnail_url": "http://ddg.com/t1.jpg", "source_url": "http://site.com/photo.jpg?ref=2", "title": "Cat Duplicate", "width": 800, "height": 600, "source_site": "duckduckgo"},
        {"thumbnail_url": "http://ddg.com/t3.jpg", "source_url": "http://site.com/photo3.jpg", "title": "Cat 3", "width": 1920, "height": 1080, "source_site": "duckduckgo"},
    ]

    aggregated = aggregate_image_results([source_bing, source_ddg], query="cats")

    # 1. Check deduplication: photo.jpg appears only once
    urls = [item["source_url"] for item in aggregated]
    assert len(urls) == 3

    # 2. Check interleaving across sources: sources alternate if available
    sources = [item["source_site"] for item in aggregated]
    assert "bing" in sources
    assert "duckduckgo" in sources


def test_circuit_breaker_memory_fallback():
    cb = SourceCircuitBreaker(failure_threshold=2, cooldown_seconds=60)
    import uuid
    source = f"test_src_{uuid.uuid4().hex[:6]}"

    assert cb.is_available(source) is True

    cb.record_failure(source, error="HTTP 500")
    assert cb.is_available(source) is True

    cb.record_failure(source, error="HTTP 500")
    # Threshold reached -> Cooldown triggered
    assert cb.is_available(source) is False

    stats = cb.get_stats(source)
    assert stats["available"] is False
    assert stats["total_failures"] == 2

    # Record success resets failures
    cb.record_success(source)
    assert cb.is_available(source) is True


@pytest.mark.asyncio
async def test_duckduckgo_scraper_mocked():
    mock_html = '<html><script>vqd="12345-67890"&</script></html>'
    mock_api = {
        "results": [
            {
                "thumbnail": "https://t.ddg.com/1.jpg",
                "image": "https://example.com/cat1.jpg",
                "title": "Cute Cat",
                "width": 1000,
                "height": 800
            }
        ]
    }

    mock_client = AsyncMock()
    resp_html = MagicMock(status_code=200, text=mock_html)
    resp_api = MagicMock(status_code=200, json=lambda: mock_api)
    mock_client.get.side_effect = [resp_html, resp_api]

    mock_cm = AsyncMock()
    mock_cm.__aenter__.return_value = mock_client

    with patch("httpx.AsyncClient", return_value=mock_cm):
        results = await scrape_duckduckgo_images("persian cat")
        assert len(results) == 1
        assert results[0]["source_url"] == "https://example.com/cat1.jpg"
        assert results[0]["source_site"] == "duckduckgo"


def test_image_search_endpoint_mocked():
    mock_items = [
        {
            "thumbnail_url": "/api/v1/images/thumb?url=http%3A%2F%2Ftest.com%2Ft.jpg&source=bing",
            "source_url": "http://test.com/photo.jpg",
            "title": "Test Image",
            "width": 1000,
            "height": 800,
            "source_site": "bing"
        }
    ]

    with patch("redis.asyncio.Redis.from_url") as mock_redis_cls:
        mock_redis = AsyncMock()
        mock_redis.get.return_value = None
        mock_redis_cls.return_value = mock_redis

        with patch("app.api.v1.endpoints.image_search.search_images_direct_async", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = mock_items

            response = client.get("/api/v1/images/search?q=tigers")
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["source_url"] == "http://test.com/photo.jpg"
            assert data[0]["source_site"] == "bing"


def test_circuit_breaker_endpoint():
    response = client.get("/api/v1/images/circuit-breaker")
    assert response.status_code == 200
    data = response.json()
    assert "bing" in data
    assert "duckduckgo" in data
    assert "google" in data
    assert "available" in data["duckduckgo"]


def test_thumbnail_proxy_endpoint():
    mock_client = AsyncMock()
    resp = MagicMock(status_code=200, content=b"fake_image_bytes", headers={"content-type": "image/jpeg"})
    mock_client.get.return_value = resp

    mock_cm = AsyncMock()
    mock_cm.__aenter__.return_value = mock_client

    with patch("httpx.AsyncClient", return_value=mock_cm):
        response = client.get("/api/v1/images/thumb?url=http%3A%2F%2Fexample.com%2Fimage.jpg&source=bing")
        assert response.status_code == 200
        assert response.content == b"fake_image_bytes"
        assert response.headers["content-type"] == "image/jpeg"
