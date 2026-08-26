from datetime import date, datetime

from pydantic import BaseModel


class MarketPriceResponse(BaseModel):
    id: int
    state: str
    market: str
    commodity: str
    variety: str
    arrival_date: date
    arrivals_mt: float
    minimum_price: float
    maximum_price: float
    modal_price: float
    source: str
    fetched_at: datetime

    model_config = {
        "from_attributes": True,
    }


class MarketForecastResponse(BaseModel):
    market: str
    variety: str

    current_date: date
    current_price: float

    forecast_date: date
    forecast_price: float

    expected_change: float
    expected_change_percent: float

    trend: str

    recent_change: float
    recent_change_percent: float

    decision_signal: str
    decision_title: str
    decision_reason: str

    forecast_horizon_days: int
    method: str