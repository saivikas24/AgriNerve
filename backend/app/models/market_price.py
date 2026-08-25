from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    market: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    commodity: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    variety: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    arrival_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    arrivals_mt: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    minimum_price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    maximum_price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    modal_price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="AGMARKNET",
    )

    fetched_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )