from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.crop import Crop
from app.models.farm import Farm
from app.models.farmer import FarmerProfile
from app.models.user import User
from app.schemas.crop import CropCreate, CropUpdate


def get_farmer_profile(
    db: Session,
    user: User,
) -> FarmerProfile | None:
    """Get the farmer profile belonging to the authenticated user."""

    statement = select(FarmerProfile).where(
        FarmerProfile.user_id == user.id
    )

    return db.scalar(statement)


def get_farmer_farm(
    db: Session,
    user: User,
    farm_id: int,
) -> Farm | None:
    """Get a farm only if it belongs to the authenticated farmer."""

    farmer_profile = get_farmer_profile(db, user)

    if farmer_profile is None:
        return None

    statement = select(Farm).where(
        Farm.id == farm_id,
        Farm.farmer_id == farmer_profile.id,
    )

    return db.scalar(statement)


def create_crop(
    db: Session,
    user: User,
    farm_id: int,
    crop_data: CropCreate,
) -> Crop | None:
    """Create a crop only on a farm owned by the authenticated farmer."""

    farm = get_farmer_farm(
        db,
        user,
        farm_id,
    )

    if farm is None:
        return None

    crop = Crop(
        farm_id=farm.id,
        crop_name=crop_data.crop_name,
        variety=crop_data.variety,
        area_acres=crop_data.area_acres,
        sowing_date=crop_data.sowing_date,
        expected_harvest_date=crop_data.expected_harvest_date,
        season=crop_data.season,
        status=crop_data.status,
    )

    db.add(crop)
    db.commit()
    db.refresh(crop)

    return crop


def get_crops(
    db: Session,
    user: User,
    farm_id: int,
) -> list[Crop] | None:
    """Get all crops belonging to a farmer's farm."""

    farm = get_farmer_farm(
        db,
        user,
        farm_id,
    )

    if farm is None:
        return None

    statement = select(Crop).where(
        Crop.farm_id == farm.id
    )

    return list(db.scalars(statement).all())


def get_crop_by_id(
    db: Session,
    user: User,
    farm_id: int,
    crop_id: int,
) -> Crop | None:
    """Get a crop only if both the farm and crop belong to the farmer."""

    farm = get_farmer_farm(
        db,
        user,
        farm_id,
    )

    if farm is None:
        return None

    statement = select(Crop).where(
        Crop.id == crop_id,
        Crop.farm_id == farm.id,
    )

    return db.scalar(statement)


def update_crop(
    db: Session,
    user: User,
    farm_id: int,
    crop_id: int,
    crop_data: CropUpdate,
) -> Crop | None:
    """Update a crop only if it belongs to the authenticated farmer."""

    crop = get_crop_by_id(
        db,
        user,
        farm_id,
        crop_id,
    )

    if crop is None:
        return None

    update_data = crop_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(crop, field, value)

    db.commit()
    db.refresh(crop)

    return crop


def delete_crop(
    db: Session,
    user: User,
    farm_id: int,
    crop_id: int,
) -> bool:
    """Delete a crop only if it belongs to the authenticated farmer."""

    crop = get_crop_by_id(
        db,
        user,
        farm_id,
        crop_id,
    )

    if crop is None:
        return False

    db.delete(crop)
    db.commit()

    return True