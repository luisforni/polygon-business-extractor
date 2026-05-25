from abc import ABC, abstractmethod
from ..schemas.business import Business


class BaseProvider(ABC):
    name: str = ""

    @abstractmethod
    async def search(
        self,
        polygon: list[list[float]],
        sectors: list[str],
    ) -> list[Business]:
        """Search businesses inside polygon, optionally filtered by sectors."""
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """Return True if the provider is configured and ready."""
        ...
