from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FarmCreate(BaseModel):
    farm_name: str
    village: str | None = None
    district: str | None = None
    state: str = "Andhra Pradesh"
    area_acres: float
    soil_type: str | None = None
    irrigation_type: str | None = None


class FarmUpdate(BaseModel):
    farm_name: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    area_acres: float | None = None
    soil_type: str | None = None
    irrigation_type: str | None = None
    preferred_market: str | None = None


class FarmResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: int
    farm_name: str
    village: str | None
    district: str | None
    state: str
    area_acres: float
    soil_type: str | None
    irrigation_type: str | None
    preferred_market: str | None
    created_at: datetime