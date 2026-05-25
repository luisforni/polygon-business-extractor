from fastapi import APIRouter
from ....schemas.search import PolygonSearch, SearchResult
from ....core.aggregator import aggregate
from ....core.config import settings
from ....providers.overpass import OverpassProvider
from ....providers.google_places import GooglePlacesProvider
from ....providers.foursquare import FoursquareProvider
from ....providers.yelp import YelpProvider

router = APIRouter()

_ALL_PROVIDERS = {
    "overpass": OverpassProvider(),
    "google": GooglePlacesProvider(),
    "foursquare": FoursquareProvider(),
    "yelp": YelpProvider(),
}


@router.post("/search", response_model=SearchResult)
async def search_businesses(payload: PolygonSearch) -> SearchResult:
    active = [_ALL_PROVIDERS[p] for p in settings.active_providers if p in _ALL_PROVIDERS]
    return await aggregate(active, payload.polygon, payload.sectors)
