from app.scrapers.bing_image_scraper import BingImageScraper, bing_image_scraper
from app.scrapers.wikimedia_fetcher import WikimediaFetcher, wikimedia_fetcher
from app.scrapers.bing_scraper import scrape_bing_images
from app.scrapers.ddg_scraper import scrape_duckduckgo_images
from app.scrapers.google_scraper import scrape_google_images
from app.scrapers.aggregator import aggregate_image_results

__all__ = [
    "WikimediaFetcher",
    "wikimedia_fetcher",
    "BingImageScraper",
    "bing_image_scraper",
    "scrape_bing_images",
    "scrape_duckduckgo_images",
    "scrape_google_images",
    "aggregate_image_results",
]
