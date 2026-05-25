import hashlib
import httpx
from shapely.geometry import shape, Point

from .base import BaseProvider
from ..schemas.business import Business, Coordinates
from ..core.config import settings
from ..core.sectors import SECTOR_YELP_ALIASES

YELP_URL = "https://api.yelp.com/v3/businesses/search"


def _yelp_categories_to_sector(categories: list[dict]) -> str:
    aliases = {c.get("alias", "") for c in categories}
    for sector, sector_aliases in SECTOR_YELP_ALIASES.items():
        if aliases & set(sector_aliases):
            return sector
    return "other"


class YelpProvider(BaseProvider):
    name = "yelp"

    def is_available(self) -> bool:
        return bool(settings.yelp_api_key)

    async def search(self, polygon: list[list[float]], sectors: list[str]) -> list[Business]:
        geom = shape({"type": "Polygon", "coordinates": [polygon]})
        center = geom.centroid
        bounds = geom.bounds
        radius = min(int(max(bounds[2] - bounds[0], bounds[3] - bounds[1]) * 111_000 / 2), 40_000)

        headers = {"Authorization": f"Bearer {settings.yelp_api_key}"}
        categories = self._get_categories(sectors)
        params: dict = {
            "latitude": center.y,
            "longitude": center.x,
            "radius": radius,
            "limit": 50,
        }
        if categories:
            params["categories"] = ",".join(categories)

        results: list[Business] = []
        offset = 0
        async with httpx.AsyncClient(timeout=20) as client:
            while offset < 200:
                params["offset"] = offset
                resp = await client.get(YELP_URL, headers=headers, params=params)
                resp.raise_for_status()
                data = resp.json()
                businesses = data.get("businesses", [])
                if not businesses:
                    break

                for biz in businesses:
                    coords = biz.get("coordinates", {})
                    lat, lng = coords.get("latitude"), coords.get("longitude")
                    if not (lat and lng):
                        continue
                    if not geom.contains(Point(lng, lat)):
                        continue

                    sector = _yelp_categories_to_sector(biz.get("categories", []))
                    if sectors and sector not in sectors:
                        continue

                    loc = biz.get("location", {})
                    address_parts = [loc.get("address1"), loc.get("city"), loc.get("country")]
                    address = ", ".join(p for p in address_parts if p) or None

                    uid = hashlib.md5(f"yelp:{biz['id']}".encode()).hexdigest()
                    results.append(
                        Business(
                            id=uid,
                            name=biz["name"],
                            sector=sector,
                            address=address,
                            coordinates=Coordinates(lat=lat, lng=lng),
                            phone=biz.get("display_phone"),
                            website=biz.get("url"),
                            rating=biz.get("rating"),
                            rating_count=biz.get("review_count"),
                            provider=self.name,
                            provider_id=biz["id"],
                            extra={"categories": biz.get("categories", [])},
                        )
                    )

                offset += len(businesses)
                if len(businesses) < 50:
                    break

        return results

    def _get_categories(self, sectors: list[str]) -> list[str]:
        if not sectors:
            return []
        cats = []
        for sector in sectors:
            cats.extend(SECTOR_YELP_ALIASES.get(sector, []))
        return cats
