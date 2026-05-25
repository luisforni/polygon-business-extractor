import asyncio
from ..schemas.business import Business
from ..schemas.search import SearchResult
from ..providers.base import BaseProvider


def _dedup(businesses: list[Business]) -> list[Business]:
    """Remove duplicates by name + approximate location (within ~50m)."""
    seen: list[Business] = []
    for biz in businesses:
        duplicate = False
        for existing in seen:
            if existing.name.lower() != biz.name.lower():
                continue
            if existing.coordinates and biz.coordinates:
                dlat = abs(existing.coordinates.lat - biz.coordinates.lat)
                dlng = abs(existing.coordinates.lng - biz.coordinates.lng)
                if dlat < 0.0005 and dlng < 0.0005:  # ~55m
                    duplicate = True
                    break
        if not duplicate:
            seen.append(biz)
    return seen


async def aggregate(
    providers: list[BaseProvider],
    polygon: list[list[float]],
    sectors: list[str],
) -> SearchResult:
    tasks = [p.search(polygon, sectors) for p in providers if p.is_available()]
    results_per_provider = await asyncio.gather(*tasks, return_exceptions=True)

    all_businesses: list[Business] = []
    providers_used: list[str] = []
    provider_errors: dict[str, str] = {}

    for provider, result in zip(
        [p for p in providers if p.is_available()], results_per_provider
    ):
        if isinstance(result, Exception):
            provider_errors[provider.name] = type(result).__name__ + ": " + str(result)
            continue
        all_businesses.extend(result)
        if result:
            providers_used.append(provider.name)

    deduped = _dedup(all_businesses)
    sectors_found = sorted({b.sector for b in deduped})

    return SearchResult(
        businesses=deduped,
        total=len(deduped),
        providers_used=providers_used,
        sectors_found=sectors_found,
        provider_errors=provider_errors,
    )
