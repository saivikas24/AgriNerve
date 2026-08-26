from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CropProfile(Base):

    __tablename__ = "crop_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    scientific_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    season: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    duration_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    water_requirement_mm: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    min_temperature_c: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    max_temperature_c: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
