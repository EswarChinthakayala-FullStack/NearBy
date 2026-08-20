import argparse
import asyncio
import sys
from app.db.session import AsyncSessionFactory
from app.services.osm_service import osm_service


def parse_args():
    parser = argparse.ArgumentParser(description="Import tourist places from OpenStreetMap Overpass API.")
    parser.add_argument("--region", type=str, default="Delhi", help="Target region or city name for OSM import")
    parser.add_argument("--dry-run", action="store_true", help="Execute search query without persisting records to database")
    return parser.parse_args()


async def main():
    args = parse_args()
    print(f"==================================================")
    print(f"   Nearby OpenStreetMap CLI Importer")
    print(f"   Target Region: {args.region}")
    print(f"   Dry Run Mode:  {args.dry_run}")
    print(f"==================================================")

    if args.dry_run:
        print("[DRY-RUN] Querying Overpass API...")
        places = await osm_service.client.fetch_tourist_places_by_city(city=args.region)
        print(f"[DRY-RUN] Found {len(places)} candidate places in '{args.region}'. No database writes performed.")
        return

    async with AsyncSessionFactory() as db:
        res = await osm_service.import_places_for_region(db, region=args.region)
        print(f"Successfully imported places:")
        print(f"  - Total Fetched:  {res.get('total_fetched', 0)}")
        print(f"  - Total Imported: {res.get('total_imported', 0)}")
        print(f"  - Total Skipped:  {res.get('total_skipped', 0)}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
        sys.exit(0)
    except Exception as err:
        print(f"ERROR: Import failed - {str(err)}", file=sys.stderr)
        sys.exit(1)
