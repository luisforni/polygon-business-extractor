from pydantic import BaseModel, field_validator
from .business import Business


class PolygonSearch(BaseModel):
    # GeoJSON polygon ring: list of [lng, lat] pairs, first == last
    polygon: list[list[float]]
    sectors: list[str] = []  # empty = all sectors

    @field_validator("polygon")
    @classmethod
    def validate_polygon(cls, v: list[list[float]]) -> list[list[float]]:
        if len(v) < 4:
            raise ValueError("Polygon must have at least 4 coordinate pairs (first == last)")
        for point in v:
            if len(point) != 2:
                raise ValueError("Each coordinate must be [lng, lat]")
        return v


class SearchResult(BaseModel):
    businesses: list[Business]
    total: int
    providers_used: list[str]
    sectors_found: list[str]
