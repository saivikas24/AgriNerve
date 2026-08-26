from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.market_price import MarketPrice
from app.services.variety_service import (
    raw_varieties_for_canonical,
)


def get_latest_market_price(
    db: Session,
    market: str,
    variety: str,
):
    raw_varieties = raw_varieties_for_canonical(
        variety
    )

    query = (
        select(MarketPrice)
        .where(
            MarketPrice.state == "Andhra Pradesh",
            MarketPrice.commodity == "Paddy(Common)",
            MarketPrice.market == market,
            MarketPrice.variety.in_(raw_varieties),
        )
        .order_by(
            MarketPrice.arrival_date.desc(),
            MarketPrice.id.desc(),
        )
        .limit(1)
    )

    return db.scalars(query).first()


def get_recent_prices(
    db: Session,
    market: str,
    variety: str,
    limit: int = 14,
):
    raw_varieties = raw_varieties_for_canonical(
        variety
    )

    query = (
        select(MarketPrice)
        .where(
            MarketPrice.state == "Andhra Pradesh",
            MarketPrice.commodity == "Paddy(Common)",
            MarketPrice.market == market,
            MarketPrice.variety.in_(raw_varieties),
        )
        .order_by(
            MarketPrice.arrival_date.desc(),
            MarketPrice.id.desc(),
        )
        .limit(limit)
    )

    return db.scalars(query).all()


def build_market_forecast(
    db: Session,
    market: str,
    variety: str,
):
    latest = get_latest_market_price(
        db,
        market,
        variety,
    )

    if latest is None:
        return None

    recent_prices = get_recent_prices(
        db,
        market,
        variety,
    )

    current_price = float(
        latest.modal_price
    )

    forecast_horizon_days = 7

    forecast_date = (
        latest.arrival_date
        + timedelta(
            days=forecast_horizon_days
        )
    )

    # ---------------------------------------------------------
    # PRODUCTION FORECAST
    # ---------------------------------------------------------
    #
    # The validated experiments showed that the naive
    # current-price baseline outperformed the tested ML
    # models for this 7-day forecasting task.
    #
    forecast_price = current_price

    expected_change = (
        forecast_price - current_price
    )

    if current_price != 0:
        expected_change_percent = (
            expected_change / current_price
        ) * 100
    else:
        expected_change_percent = 0.0

    # ---------------------------------------------------------
    # RECENT MARKET MOVEMENT
    # ---------------------------------------------------------

    sorted_prices = sorted(
        recent_prices,
        key=lambda item: (
            item.arrival_date,
            item.id,
        ),
    )

    if len(sorted_prices) >= 2:
        previous_price = float(
            sorted_prices[-2].modal_price
        )

        recent_change = (
            current_price - previous_price
        )

        if previous_price != 0:
            recent_change_percent = (
                recent_change
                / previous_price
            ) * 100
        else:
            recent_change_percent = 0.0
    else:
        recent_change = 0.0
        recent_change_percent = 0.0

    # ---------------------------------------------------------
    # TREND
    # ---------------------------------------------------------

    if recent_change_percent > 1:
        trend = "rising"

    elif recent_change_percent < -1:
        trend = "falling"

    else:
        trend = "stable"

    # ---------------------------------------------------------
    # DECISION SIGNAL
    # ---------------------------------------------------------
    #
    # Since the production forecast is currently flat,
    # we do not make an unsupported SELL/BUY claim.
    #
    # The signal communicates what the farmer should do
    # with the available market evidence.
    #

    if trend == "rising":
        decision_signal = "WATCH"
        decision_title = (
            "Price is showing upward movement"
        )
        decision_reason = (
            "The latest market observation is "
            "higher than the previous observation. "
            "Monitor the next few market updates "
            "before making a selling decision."
        )

    elif trend == "falling":
        decision_signal = "REVIEW"
        decision_title = (
            "Price is showing downward movement"
        )
        decision_reason = (
            "The latest market observation is "
            "lower than the previous observation. "
            "Review current market conditions "
            "before delaying a sale."
        )

    else:
        decision_signal = "HOLD"
        decision_title = (
            "Market price is currently stable"
        )
        decision_reason = (
            "The latest price movement is small "
            "and the validated 7-day baseline "
            "expects the current modal price "
            "to remain unchanged."
        )

    return {
        "market": latest.market,
        "variety": variety,

        "current_date": latest.arrival_date,
        "current_price": current_price,

        "forecast_date": forecast_date,
        "forecast_price": forecast_price,

        "expected_change": expected_change,
        "expected_change_percent": (
            expected_change_percent
        ),

        "trend": trend,

        "recent_change": recent_change,
        "recent_change_percent": (
            recent_change_percent
        ),

        "decision_signal": decision_signal,
        "decision_title": decision_title,
        "decision_reason": decision_reason,

        "forecast_horizon_days": (
            forecast_horizon_days
        ),

        "method": (
            "naive_7_day_baseline"
        ),
    }