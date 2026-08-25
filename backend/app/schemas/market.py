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
