from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.farm import Farm


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id"),
        nullable=False,
        index=True,
    )

    crop_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    variety: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    area_acres: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    sowing_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    expected_harvest_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    season: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="growing",
        nullable=False,
    )

    farm: Mapped["Farm"] = relationship(
        back_populates="crops",
    )