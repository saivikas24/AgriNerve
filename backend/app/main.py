from fastapi import FastAPI


app = FastAPI(
    title="AgriNerve API",
    description="Agricultural Decision Intelligence Platform for Andhra Pradesh",
    version="0.1.0",
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriNerve API",
        "version": "0.1.0",
    }