from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WaterReservoirResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    source_id: int | None

    district: str
    mandal: str
    reservoir: str
    river: str | None

    present_level_m: float | None
    present_level_ft: float | None

    present_capacity_mcum: float | None
    present_capacity_tmc: float | None

    frl_m: float | None
    frl_ft: float | None

    gross_capacity_mcum: float | None
    gross_capacity_tmc: float | None

    storage_percentage: float | None

    updated_at: datetime | None
    source: str
    fetched_at: datetime
