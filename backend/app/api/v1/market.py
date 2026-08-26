from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.market_price import MarketPrice
from app.schemas.market import (
    MarketPriceResponse,
    MarketForecastResponse,
)
from app.services.variety_service import (
    normalize_variety,
    raw_varieties_for_canonical,
)
from app.services.market_forecast_service import (
    build_market_forecast,
)


router = APIRouter(
    prefix="/market",
    tags=["Market Intelligence"],
)


@router.get(
    "/markets",
    response_model=list[str],
)
def get_markets(
    db: Session = Depends(get_db),
):
    query = (
        select(MarketPrice.market)
        .where(
            MarketPrice.state == "Andhra Pradesh",
            MarketPrice.commodity == "Paddy(Common)",
        )
        .distinct()
        .order_by(MarketPrice.market)
    )

    return db.scalars(query).all()


@router.get(
    "/varieties",
    response_model=list[str],
)
def get_varieties(
    market: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        select(MarketPrice.variety)
        .where(
            MarketPrice.state == "Andhra Pradesh",
            MarketPrice.commodity == "Paddy(Common)",
        )
    )

    if market:
        query = query.where(
            MarketPrice.market == market
        )

    raw_varieties = db.scalars(
        query.distinct().order_by(
            MarketPrice.variety
        )
    ).all()

    canonical_varieties = {
        normalize_variety(variety)
        for variety in raw_varieties
    }

    return sorted(canonical_varieties)


@router.get(
    "/prices",
    response_model=list[MarketPriceResponse],
)
def get_market_prices(
    market: str | None = Query(default=None),
    variety: str | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    limit: int = Query(
        default=100,
        ge=1,
        le=1000,
    ),
    db: Session = Depends(get_db),
):
    query = select(MarketPrice).where(
        MarketPrice.state == "Andhra Pradesh",
        MarketPrice.commodity == "Paddy(Common)",
    )

    if market:
        query = query.where(
            MarketPrice.market == market
        )

    if variety:
        raw_varieties = raw_varieties_for_canonical(
            variety
        )

        query = query.where(
            MarketPrice.variety.in_(raw_varieties)
        )

    if start_date:
        query = query.where(
            MarketPrice.arrival_date >= start_date
        )

    if end_date:
        query = query.where(
            MarketPrice.arrival_date <= end_date
        )

    query = (
        query
        .order_by(
            MarketPrice.arrival_date.desc(),
            MarketPrice.id.desc(),
        )
        .limit(limit)
    )

    return db.scalars(query).all()


@router.get(
    "/forecast",
    response_model=MarketForecastResponse,
)
def get_market_forecast(
    market: str = Query(...),
    variety: str = Query(...),
    db: Session = Depends(get_db),
):
    forecast = build_market_forecast(
        db,
        market,
        variety,
    )

    if forecast is None:
        return {
            "error": (
                "No market data found for "
                "the selected market and variety."
            )
        }

    return forecast