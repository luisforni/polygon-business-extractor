import hashlib
import httpx
from shapely.geometry import shape, Point

from .base import BaseProvider
from ..schemas.business import Business, Coordinates
from ..core.config import settings
from ..core.sectors import SECTOR_GOOGLE_TYPES

PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


def _google_type_to_sector(types: list[str]) -> str:
    for sector, google_types in SECTOR_GOOGLE_TYPES.items():
        if any(t in google_types for t in types):
            return sector
    return "other"


class GooglePlacesProvider(BaseProvider):
    name = "google"

    def is_available(self) -> bool:
        return bool(settings.google_places_api_key)

    async def search(self, polygon: list[list[float]], sectors: list[str]) -> list[Business]:
        geom = shape({"type": "Polygon", "coordinates": [polygon]})
        center = geom.centroid
        # Approximate bounding radius in meters
        bounds = geom.bounds  # (minx, miny, maxx, maxy)
        radius = min(
            int(max(bounds[2] - bounds[0], bounds[3] - bounds[1]) * 111_000 / 2),
            50_000,
        )

        types_to_query = self._get_types(sectors)
        all_businesses: dict[str, Business] = {}

        async with httpx.AsyncClient(timeout=20) as client:
            for place_type in types_to_query:
                results = await self._paginate(client, center.y, center.x, radius, place_type)
                for place in results:
                    loc = place.get("geometry", {}).get("location", {})
                    lat, lng = loc.get("lat"), loc.get("lng")
                    if not (lat and lng):
                        continue
                    if not geom.contains(Point(lng, lat)):
                        continue

                    place_id = place["place_id"]
                    if place_id in all_businesses:
                        continue

                    sector = _google_type_to_sector(place.get("types", []))
                    if sectors and sector not in sectors:
                        continue

                    uid = hashlib.md5(f"google:{place_id}".encode()).hexdigest()
                    all_businesses[place_id] = Business(
                        id=uid,
                        name=place["name"],
                        sector=sector,
                        address=place.get("vicinity"),
                        coordinates=Coordinates(lat=lat, lng=lng),
                        rating=place.get("rating"),
                        rating_count=place.get("user_ratings_total"),
                        provider=self.name,
                        provider_id=place_id,
                        extra={"types": place.get("types", [])},
                    )

        return list(all_businesses.values())

    async def _paginate(
        self, client: httpx.AsyncClient, lat: float, lng: float, radius: int, place_type: str
    ) -> list[dict]:
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "type": place_type,
            "key": settings.google_places_api_key,
        }
        results = []
        for _ in range(3):  # max 3 pages
            resp = await client.get(PLACES_NEARBY_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            results.extend(data.get("results", []))
            token = data.get("next_page_token")
            if not token:
                break
            params = {"pagetoken": token, "key": settings.google_places_api_key}
        return results

    def _get_types(self, sectors: list[str]) -> list[str]:
        if not sectors:
            return list({t for types in SECTOR_GOOGLE_TYPES.values() for t in types})
        types = set()
        for sector in sectors:
            types.update(SECTOR_GOOGLE_TYPES.get(sector, []))
        return list(types)
