from datetime import date

from pydantic import BaseModel, ConfigDict


class CropCreate(BaseModel):
    crop_name: str
    variety: str | None = None
    area_acres: float
    sowing_date: date | None = None
    expected_harvest_date: date | None = None
    season: str | None = None
    status: str = "growing"


class CropUpdate(BaseModel):
    crop_name: str | None = None
    variety: str | None = None
    area_acres: float | None = None
    sowing_date: date | None = None
    expected_harvest_date: date | None = None
    season: str | None = None
    status: str | None = None


class CropResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    crop_name: str
    variety: str | None
    area_acres: float
    sowing_date: date | None
    expected_harvest_date: date | None
    season: str | None
    status: str