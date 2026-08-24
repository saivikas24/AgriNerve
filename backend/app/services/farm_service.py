from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.farm import Farm
from app.models.farmer import FarmerProfile
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmUpdate


def get_farmer_profile(
    db: Session,
    user: User,
) -> FarmerProfile | None:
    """Get the farmer profile belonging to the authenticated user."""
    statement = select(FarmerProfile).where(
        FarmerProfile.user_id == user.id
    )

    return db.scalar(statement)


def create_farm(
    db: Session,
    user: User,
    farm_data: FarmCreate,
) -> Farm:
    """Create a farm for the authenticated farmer."""

    farmer_profile = get_farmer_profile(db, user)

    if farmer_profile is None:
        raise ValueError("Farmer profile not found")

    farm = Farm(
        farmer_id=farmer_profile.id,
        farm_name=farm_data.farm_name,
        village=farm_data.village,
        district=farm_data.district,
        state=farm_data.state,
        area_acres=farm_data.area_acres,
        soil_type=farm_data.soil_type,
        irrigation_type=farm_data.irrigation_type,
    )

    db.add(farm)
    db.commit()
    db.refresh(farm)

    return farm


def get_farms(
    db: Session,
    user: User,
) -> list[Farm]:
    """Get all farms belonging to the authenticated farmer."""

    farmer_profile = get_farmer_profile(db, user)

    if farmer_profile is None:
        return []

    statement = select(Farm).where(
        Farm.farmer_id == farmer_profile.id
    )

    return list(db.scalars(statement).all())


def get_farm_by_id(
    db: Session,
    user: User,
    farm_id: int,
) -> Farm | None:
    """Get one farm if it belongs to the authenticated farmer."""

    farmer_profile = get_farmer_profile(db, user)

    if farmer_profile is None:
        return None

    statement = select(Farm).where(
        Farm.id == farm_id,
        Farm.farmer_id == farmer_profile.id,
    )

    return db.scalar(statement)


def update_farm(
    db: Session,
    user: User,
    farm_id: int,
    farm_data: FarmUpdate,
) -> Farm | None:
    """Update a farm only if it belongs to the authenticated farmer."""

    farm = get_farm_by_id(db, user, farm_id)

    if farm is None:
        return None

    update_data = farm_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(farm, field, value)

    db.commit()
    db.refresh(farm)

    return farm


def delete_farm(
    db: Session,
    user: User,
    farm_id: int,
) -> bool:
    """Delete a farm only if it belongs to the authenticated farmer."""

    farm = get_farm_by_id(db, user, farm_id)

    if farm is None:
        return False

    db.delete(farm)
    db.commit()

    return True