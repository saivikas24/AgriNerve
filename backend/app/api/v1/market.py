from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.market_price import MarketPrice
from app.schemas.market import MarketPriceResponse


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
        .distinct()
    )

    if market:
        query = query.where(
            MarketPrice.market == market
        )

    query = query.order_by(MarketPrice.variety)

    return db.scalars(query).all()


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
        query = query.where(
            MarketPrice.variety == variety
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
