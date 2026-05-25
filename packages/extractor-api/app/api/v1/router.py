from fastapi import APIRouter
from .endpoints import businesses, sectors, searches

router = APIRouter(prefix="/v1")
router.include_router(businesses.router, prefix="/businesses", tags=["businesses"])
router.include_router(sectors.router, prefix="/sectors", tags=["sectors"])
router.include_router(searches.router, prefix="/searches", tags=["searches"])
