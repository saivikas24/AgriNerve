from fastapi import FastAPI

from app.api.v1.router import api_router


app = FastAPI(
    title="AgriNerve API",
    description="Agricultural Decision Intelligence Platform for Andhra Pradesh",
    version="0.1.0",
)


app.include_router(
    api_router,
    prefix="/api/v1",
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriNerve API",
        "version": "0.1.0",
    }