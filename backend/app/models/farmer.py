from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.farm import Farm
    from app.models.user import User

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
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

    user: Mapped["User"] = relationship(
        back_populates="farmer_profile",
    )

    farms: Mapped[list["Farm"]] = relationship(
        back_populates="farmer",
    )