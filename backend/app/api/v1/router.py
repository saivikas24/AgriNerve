from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.crops import router as crops_router
from app.api.v1.disease import router as disease_router
from app.api.v1.farms import router as farms_router
from app.api.v1.market import router as market_router
from app.api.v1.water import router as water_router


api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(farms_router)
api_router.include_router(crops_router)
api_router.include_router(disease_router)
api_router.include_router(market_router)
api_router.include_router(water_router)
