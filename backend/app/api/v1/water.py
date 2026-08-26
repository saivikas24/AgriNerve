from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.reservoir import WaterReservoir
from app.schemas.water import WaterReservoirResponse


router = APIRouter(
    prefix="/water",
    tags=["Water Intelligence"],
)


@router.get(
    "/reservoirs",
    response_model=list[WaterReservoirResponse],
)
def get_reservoirs(
    district: str | None = Query(default=None),
    mandal: str | None = Query(default=None),
    limit: int = Query(
        default=100,
        ge=1,
        le=200,
    ),
    db: Session = Depends(get_db),
):
    query = select(WaterReservoir)

    if district:
        query = query.where(
            WaterReservoir.district == district
        )

    if mandal:
        query = query.where(
            WaterReservoir.mandal == mandal
        )

    query = (
        query
        .order_by(
            WaterReservoir.storage_percentage.desc()
        )
        .limit(limit)
    )

    return db.scalars(query).all()


@router.get(
    "/reservoirs/{reservoir_id}",
    response_model=WaterReservoirResponse,
)
def get_reservoir(
    reservoir_id: int,
    db: Session = Depends(get_db),
):
    reservoir = db.scalar(
        select(WaterReservoir).where(
            WaterReservoir.id == reservoir_id
        )
    )

    if reservoir is None:
        raise HTTPException(
            status_code=404,
            detail="Reservoir not found",
        )

    return reservoir


@router.get(
    "/districts",
    response_model=list[str],
)
def get_water_districts(
    db: Session = Depends(get_db),
):
    query = (
        select(WaterReservoir.district)
        .distinct()
        .order_by(WaterReservoir.district)
    )

    return db.scalars(query).all()


@router.get(
    "/mandals",
    response_model=list[str],
)
def get_water_mandals(
    district: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = select(
        WaterReservoir.mandal
    )

    if district:
        query = query.where(
            WaterReservoir.district == district
        )

    query = (
        query
        .distinct()
        .order_by(WaterReservoir.mandal)
    )

    return db.scalars(query).all()
