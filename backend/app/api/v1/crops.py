from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.crop import CropCreate, CropResponse, CropUpdate
from app.services.crop_service import (
    create_crop,
    delete_crop,
    get_crop_by_id,
    get_crops,
    update_crop,
)


router = APIRouter(
    prefix="/farms/{farm_id}/crops",
    tags=["Crops"],
)


@router.post(
    "",
    response_model=CropResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    farm_id: int,
    crop_data: CropCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    crop = create_crop(
        db,
        current_user,
        farm_id,
        crop_data,
    )

    if crop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )

    return crop


@router.get(
    "",
    response_model=list[CropResponse],
)
def list_all(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    crops = get_crops(
        db,
        current_user,
        farm_id,
    )

    if crops is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )

    return crops


@router.get(
    "/{crop_id}",
    response_model=CropResponse,
)
def get_one(
    farm_id: int,
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    crop = get_crop_by_id(
        db,
        current_user,
        farm_id,
        crop_id,
    )

    if crop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found",
        )

    return crop


@router.put(
    "/{crop_id}",
    response_model=CropResponse,
)
def update(
    farm_id: int,
    crop_id: int,
    crop_data: CropUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    crop = update_crop(
        db,
        current_user,
        farm_id,
        crop_id,
        crop_data,
    )

    if crop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found",
        )

    return crop


@router.delete(
    "/{crop_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    farm_id: int,
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_crop(
        db,
        current_user,
        farm_id,
        crop_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found",
        )