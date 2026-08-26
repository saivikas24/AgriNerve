from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.crop_profile import CropProfile
from app.models.crop_growth_stage import CropGrowthStage


router = APIRouter(
    prefix="/crop-intelligence",
    tags=["Crop Intelligence"],
)


@router.get("/paddy")
def get_paddy_profile(
    db: Session = Depends(get_db),
):
    profile = (
        db.query(CropProfile)
        .filter(
            CropProfile.name == "Paddy",
            CropProfile.active.is_(True),
        )
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Paddy crop profile not found",
        )

    return {
        "id": profile.id,
        "name": profile.name,
        "scientific_name": profile.scientific_name,
        "season": profile.season,
        "duration_days": profile.duration_days,
        "water_requirement_mm": profile.water_requirement_mm,
        "temperature": {
            "min_c": profile.min_temperature_c,
            "max_c": profile.max_temperature_c,
        },
        "description": profile.description,
    }


@router.get("/paddy/stages")
def get_paddy_growth_stages(
    db: Session = Depends(get_db),
):
    stages = (
        db.query(CropGrowthStage)
        .filter(CropGrowthStage.crop_id == 1)
        .order_by(CropGrowthStage.stage_order)
        .all()
    )

    return [
        {
            "stage_order": stage.stage_order,
            "stage_name": stage.stage_name,
            "typical_duration_days": stage.typical_duration_days,
            "water_priority": stage.water_priority,
            "temperature_note": stage.temperature_note,
            "management_focus": stage.management_focus,
        }
        for stage in stages
    ]
