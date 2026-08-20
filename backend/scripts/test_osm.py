import asyncio
import httpx

async def test_city_bbox_import(city_name: str = "Chennai"):
    headers = {"User-Agent": "NearbyTouristApp/1.0 (contact@nearbyapp.com)"}
    async with httpx.AsyncClient(headers=headers, timeout=20.0) as client:
        # 1. Geocode city via Nominatim
        nom_url = f"https://nominatim.openstreetmap.org/search?city={city_name}&format=json&limit=1"
        r_nom = await client.get(nom_url)
        nom_data = r_nom.json()
        bbox = nom_data[0].get("boundingbox") # [south, north, west, east]
        s, n, w, e = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
        print(f"BBOX: south={s}, west={w}, north={n}, east={e}")

        query = f"""[out:json][timeout:25];
(
  node["tourism"]({s},{w},{n},{e});
  way["tourism"]({s},{w},{n},{e});
  node["historic"]({s},{w},{n},{e});
  way["historic"]({s},{w},{n},{e});
  node["amenity"~"place_of_worship|museum"]({s},{w},{n},{e});
  node["leisure"~"park|beach|garden"]({s},{w},{n},{e});
);
out body center 100;"""

        r_op = await client.post("https://z.overpass-api.de/api/interpreter", data={"data": query})
        print("OVERPASS STATUS:", r_op.status_code)
        elements = r_op.json().get("elements", [])
        print("COUNT FOUND:", len(elements))
        if elements:
            print("FIRST:", elements[0].get("tags", {}).get("name"))

asyncio.run(test_city_bbox_import("Chennai"))
