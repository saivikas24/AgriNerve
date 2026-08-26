from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CropGrowthStage(Base):

    __tablename__ = "crop_growth_stages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    crop_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    stage_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    stage_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    typical_duration_days: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    water_priority: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    temperature_note: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    management_focus: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
