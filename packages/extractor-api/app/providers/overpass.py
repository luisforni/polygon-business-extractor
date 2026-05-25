import hashlib
import httpx
from shapely.geometry import shape, Point

from .base import BaseProvider
from ..schemas.business import Business, Coordinates
from ..core.sectors import SECTOR_OSM_TAGS

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def _osm_to_sector(tags: dict) -> str:
    for sector, osm_tags in SECTOR_OSM_TAGS.items():
        for key, values in osm_tags.items():
            tag_val = tags.get(key, "")
            if isinstance(values, list) and tag_val in values:
                return sector
            if values == "*" and tag_val:
                return sector
    return "other"


class OverpassProvider(BaseProvider):
    name = "overpass"

    def is_available(self) -> bool:
        return True

    async def search(self, polygon: list[list[float]], sectors: list[str]) -> list[Business]:
        poly_str = " ".join(f"{lat} {lng}" for lng, lat in polygon)
        query = self._build_query(poly_str, sectors)

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(OVERPASS_URL, data={"data": query})
            resp.raise_for_status()
            data = resp.json()

        geom = shape({"type": "Polygon", "coordinates": [polygon]})
        results: list[Business] = []

        for el in data.get("elements", []):
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            lat = el.get("lat") or (el.get("center") or {}).get("lat")
            lng = el.get("lon") or (el.get("center") or {}).get("lon")
            if lat and lng and not geom.contains(Point(lng, lat)):
                continue

            sector = _osm_to_sector(tags)
            if sectors and sector not in sectors:
                continue

            uid = hashlib.md5(f"osm:{el['type']}:{el['id']}".encode()).hexdigest()
            results.append(
                Business(
                    id=uid,
                    name=name,
                    sector=sector,
                    address=self._build_address(tags),
                    coordinates=Coordinates(lat=lat, lng=lng) if lat and lng else None,
                    phone=tags.get("phone") or tags.get("contact:phone"),
                    website=tags.get("website") or tags.get("contact:website"),
                    provider=self.name,
                    provider_id=str(el["id"]),
                    extra={"osm_type": el["type"], "tags": tags},
                )
            )

        return results

    def _build_query(self, poly_str: str, sectors: list[str]) -> str:
        filters = self._sector_filters(sectors)
        unions = "\n".join(
            f'  {f}(poly:"{poly_str}");' for f in filters
        )
        return f"""
[out:json][timeout:25];
(
{unions}
);
out center;
""".strip()

    def _sector_filters(self, sectors: list[str]) -> list[str]:
        if not sectors:
            return ['node["name"]["amenity"]', 'node["name"]["shop"]', 'node["name"]["tourism"]',
                    'way["name"]["amenity"]', 'way["name"]["shop"]']
        filters = []
        for sector in sectors:
            for key, values in SECTOR_OSM_TAGS.get(sector, {}).items():
                if isinstance(values, list):
                    val_filter = "|".join(values)
                    filters.append(f'node["{key}"~"{val_filter}"]["name"]')
                    filters.append(f'way["{key}"~"{val_filter}"]["name"]')
                elif values == "*":
                    filters.append(f'node["{key}"]["name"]')
                    filters.append(f'way["{key}"]["name"]')
        return filters or ['node["name"]["amenity"]']

    def _build_address(self, tags: dict) -> str | None:
        parts = [
            tags.get("addr:street"),
            tags.get("addr:housenumber"),
            tags.get("addr:city"),
        ]
        parts = [p for p in parts if p]
        return ", ".join(parts) if parts else None
