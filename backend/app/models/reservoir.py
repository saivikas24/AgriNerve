from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class WaterReservoir(Base):
    __tablename__ = "water_reservoirs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    source_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    district: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    mandal: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    reservoir: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    river: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    present_level_m: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    present_level_ft: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    present_capacity_mcum: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    present_capacity_tmc: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    frl_m: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    frl_ft: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    gross_capacity_mcum: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    gross_capacity_tmc: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    storage_percentage: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="AP_DES",
    )

    fetched_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
