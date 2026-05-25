from pydantic import BaseModel


class Coordinates(BaseModel):
    lat: float
    lng: float


class Business(BaseModel):
    id: str
    name: str
    sector: str
    address: str | None = None
    coordinates: Coordinates | None = None
    phone: str | None = None
    website: str | None = None
    rating: float | None = None
    rating_count: int | None = None
    hours: dict | None = None
    provider: str
    provider_id: str
    extra: dict = {}
