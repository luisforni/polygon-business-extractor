import hashlib
import httpx
from shapely.geometry import shape, Point

from .base import BaseProvider
from ..schemas.business import Business, Coordinates
from ..core.config import settings
from ..core.sectors import SECTOR_FOURSQUARE_IDS

FSQ_URL = "https://api.foursquare.com/v3/places/search"


def _fsq_category_to_sector(categories: list[dict]) -> str:
    cat_ids = {str(c.get("id", "")) for c in categories}
    for sector, ids in SECTOR_FOURSQUARE_IDS.items():
        if cat_ids & set(ids):
            return sector
    return "other"


class FoursquareProvider(BaseProvider):
    name = "foursquare"

    def is_available(self) -> bool:
        return bool(settings.foursquare_api_key)

    async def search(self, polygon: list[list[float]], sectors: list[str]) -> list[Business]:
        geom = shape({"type": "Polygon", "coordinates": [polygon]})
        center = geom.centroid
        bounds = geom.bounds
        radius = min(int(max(bounds[2] - bounds[0], bounds[3] - bounds[1]) * 111_000 / 2), 50_000)

        category_ids = self._get_category_ids(sectors)
        headers = {
            "Authorization": settings.foursquare_api_key,
            "Accept": "application/json",
        }
        params: dict = {
            "ll": f"{center.y},{center.x}",
            "radius": radius,
            "limit": 50,
            "fields": "fsq_id,name,categories,location,tel,website,rating,stats,hours",
        }
        if category_ids:
            params["categories"] = ",".join(category_ids)

        results: list[Business] = []
        async with httpx.AsyncClient(timeout=20) as client:
            cursor = None
            while True:
                if cursor:
                    params["cursor"] = cursor
                resp = await client.get(FSQ_URL, headers=headers, params=params)
                resp.raise_for_status()
                data = resp.json()

                for place in data.get("results", []):
                    geo = place.get("geocodes", {}).get("main", {})
                    lat, lng = geo.get("lat"), geo.get("lng")
                    if not (lat and lng):
                        continue
                    if not geom.contains(Point(lng, lat)):
                        continue

                    sector = _fsq_category_to_sector(place.get("categories", []))
                    if sectors and sector not in sectors:
                        continue

                    loc = place.get("location", {})
                    uid = hashlib.md5(f"fsq:{place['fsq_id']}".encode()).hexdigest()
                    results.append(
                        Business(
                            id=uid,
                            name=place["name"],
                            sector=sector,
                            address=loc.get("formatted_address"),
                            coordinates=Coordinates(lat=lat, lng=lng),
                            phone=place.get("tel"),
                            website=place.get("website"),
                            rating=place.get("rating"),
                            provider=self.name,
                            provider_id=place["fsq_id"],
                            extra={"categories": place.get("categories", [])},
                        )
                    )

                cursor = resp.headers.get("Link")
                if not cursor or len(results) >= 200:
                    break

        return results

    def _get_category_ids(self, sectors: list[str]) -> list[str]:
        if not sectors:
            return []
        ids = []
        for sector in sectors:
            ids.extend(SECTOR_FOURSQUARE_IDS.get(sector, []))
        return ids
