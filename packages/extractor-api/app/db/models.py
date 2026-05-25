import uuid
import json
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class Search(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    polygon_json: str          # JSON-serialized list[list[float]]
    sectors_json: str          # JSON-serialized list[str]
    result_json: str | None = None  # JSON-serialized SearchResult
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Helpers to work with native Python types
    @property
    def polygon(self) -> list[list[float]]:
        return json.loads(self.polygon_json)

    @property
    def sectors(self) -> list[str]:
        return json.loads(self.sectors_json)

    @property
    def result(self) -> dict | None:
        return json.loads(self.result_json) if self.result_json else None
