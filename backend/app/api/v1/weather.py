from fastapi import APIRouter, HTTPException

from app.services.weather_service import (
    get_weather_for_location,
)


router = APIRouter(
    prefix="/weather",
    tags=["Weather Intelligence"],
)


@router.get("")
def weather(
    district: str,
    mandal: str,
):
    """
    Get current and 7-day weather data
    for an Andhra Pradesh location.
    """

    try:

        return get_weather_for_location(
            district=district,
            mandal=mandal,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Weather service unavailable: {exc}",
        )
