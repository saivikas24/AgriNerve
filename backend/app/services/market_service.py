from datetime import date, datetime
from typing import Any

import requests
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.market_price import MarketPrice


AGMARKNET_BASE_URL = "https://api.agmarknet.gov.in/v1"

HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://agmarknet.gov.in",
    "Referer": "https://agmarknet.gov.in/",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/151.0.0.0 Safari/537.36"
    ),
}


def fetch_paddy_prices(
    year: int | None = None,
    month: int | None = None,
) -> list[dict[str, Any]]:
    """
    Fetch Andhra Pradesh Paddy(Common) market prices
    directly from the live AGMARKNET API.

    Every observation returned by AGMARKNET is preserved.
    """

    now = datetime.now()

    year = year or now.year
    month = month or now.month

    url = (
        f"{AGMARKNET_BASE_URL}/"
        "prices-and-arrivals/date-wise/specific-commodity"
    )

    params = {
        "year": year,
        "month": month,
        "stateId": 2,
        "commodityId": 2,
    }

    response = requests.get(
        url,
        headers=HEADERS,
        params=params,
        timeout=60,
    )

    response.raise_for_status()

    payload = response.json()

    if not payload.get("success"):
        raise RuntimeError(
            payload.get(
                "message",
                "AGMARKNET request failed",
            )
        )

    records: list[dict[str, Any]] = []

    for market in payload.get("markets", []):
        market_name = market.get("marketName")

        for date_entry in market.get("dates", []):
            arrival_date = date_entry.get("arrivalDate")

            for price_entry in date_entry.get("data", []):
                records.append(
                    {
                        "market": market_name,
                        "arrival_date": arrival_date,
                        "arrivals_mt": price_entry.get("arrivals"),
                        "variety": price_entry.get("variety"),
                        "minimum_price": price_entry.get(
                            "minimumPrice"
                        ),
                        "maximum_price": price_entry.get(
                            "maximumPrice"
                        ),
                        "modal_price": price_entry.get(
                            "modalPrice"
                        ),
                        "commodity": "Paddy(Common)",
                        "state": "Andhra Pradesh",
                        "source": "AGMARKNET",
                    }
                )

    return records


def _parse_arrival_date(value: str) -> date:
    """
    Convert AGMARKNET date format DD/MM/YYYY
    into a Python date object.
    """
    return datetime.strptime(
        value,
        "%d/%m/%Y",
    ).date()


def _record_exists(
    db: Session,
    record: dict[str, Any],
    arrival_date: date,
) -> bool:
    """
    Check whether the exact AGMARKNET observation
    already exists.

    IMPORTANT:
    Market + variety + date alone is NOT enough to
    identify a duplicate because AGMARKNET can return
    multiple observations for the same combination.

    We therefore compare the complete observation values.
    """

    existing = db.scalar(
        select(MarketPrice).where(
            MarketPrice.state == record["state"],
            MarketPrice.market == record["market"],
            MarketPrice.commodity == record["commodity"],
            MarketPrice.variety == record["variety"],
            MarketPrice.arrival_date == arrival_date,
            MarketPrice.arrivals_mt == record["arrivals_mt"],
            MarketPrice.minimum_price
            == record["minimum_price"],
            MarketPrice.maximum_price
            == record["maximum_price"],
            MarketPrice.modal_price
            == record["modal_price"],
        )
    )

    return existing is not None


def ingest_paddy_prices(
    db: Session,
    year: int | None = None,
    month: int | None = None,
) -> dict[str, int]:
    """
    Fetch live AGMARKNET Paddy(Common) prices and store
    observations in PostgreSQL.

    Multiple observations for the same market, variety,
    and date are preserved when their actual values differ.

    Exact repeated observations are skipped.
    """

    records = fetch_paddy_prices(
        year=year,
        month=month,
    )

    inserted = 0
    skipped = 0

    for record in records:

        arrival_date = _parse_arrival_date(
            record["arrival_date"]
        )

        if _record_exists(
            db,
            record,
            arrival_date,
        ):
            skipped += 1
            continue

        market_price = MarketPrice(
            state=record["state"],
            market=record["market"],
            commodity=record["commodity"],
            variety=record["variety"],
            arrival_date=arrival_date,
            arrivals_mt=record["arrivals_mt"],
            minimum_price=record["minimum_price"],
            maximum_price=record["maximum_price"],
            modal_price=record["modal_price"],
            source=record["source"],
            fetched_at=datetime.utcnow(),
        )

        db.add(market_price)
        inserted += 1

    db.commit()

    return {
        "fetched": len(records),
        "inserted": inserted,
        "skipped": skipped,
    }
