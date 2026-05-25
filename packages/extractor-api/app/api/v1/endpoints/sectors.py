from fastapi import APIRouter
from ....core.sectors import SECTORS

router = APIRouter()


@router.get("/", response_model=list[str])
async def list_sectors() -> list[str]:
    return SECTORS
