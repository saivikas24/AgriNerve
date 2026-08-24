from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmResponse, FarmUpdate
from app.services.farm_service import (
    create_farm,
    delete_farm,
    get_farm_by_id,
    get_farms,
    update_farm,
)


router = APIRouter(
    prefix="/farms",
    tags=["Farms"],
)


@router.post(
    "",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    farm_data: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return create_farm(
            db,
            current_user,
            farm_data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[FarmResponse],
)
def list_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_farms(
        db,
        current_user,
    )


@router.get(
    "/{farm_id}",
    response_model=FarmResponse,
)
def get_one(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = get_farm_by_id(
        db,
        current_user,
        farm_id,
    )

    if farm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )

    return farm


@router.put(
    "/{farm_id}",
    response_model=FarmResponse,
)
def update(
    farm_id: int,
    farm_data: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = update_farm(
        db,
        current_user,
        farm_id,
        farm_data,
    )

    if farm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )

    return farm


@router.delete(
    "/{farm_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_farm(
        db,
        current_user,
        farm_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )