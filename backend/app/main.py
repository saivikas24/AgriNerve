from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.crops import router as crops_router
from app.api.v1.disease import router as disease_router
from app.api.v1.farms import router as farms_router
from app.api.v1.market import router as market_router
from app.api.v1.water import router as water_router


app = FastAPI(
    title="AgriNerve API",
    description="Agricultural Decision Intelligence Platform for Andhra Pradesh",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    farms_router,
    prefix="/api/v1",
)

app.include_router(
    crops_router,
    prefix="/api/v1",
)

app.include_router(
    disease_router,
    prefix="/api/v1",
)

app.include_router(
    market_router,
    prefix="/api/v1",
)

app.include_router(
    water_router,
    prefix="/api/v1",
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriNerve API",
        "version": "0.1.0",
    }
