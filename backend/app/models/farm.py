from typing import TYPE_CHECKING

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.farmer import FarmerProfile


class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    farmer_id: Mapped[int] = mapped_column(
        ForeignKey("farmer_profiles.id"),
        nullable=False,
        index=True,
    )

    farm_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    village: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    district: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        default="Andhra Pradesh",
        nullable=False,
    )

    area_acres: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    soil_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    irrigation_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    farmer: Mapped["FarmerProfile"] = relationship(
        back_populates="farms",
    )