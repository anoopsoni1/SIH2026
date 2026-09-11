from pydantic import BaseModel, Field
from typing import List, Optional

class DemandForecastRequest(BaseModel):
    zone_id: str = Field(..., example="Zone-A-North")
    service_category: str = Field(..., example="Plumbing")
    target_date: Optional[str] = Field(None, example="2026-09-15")
    current_worker_count: int = Field(15, ge=0)

class DemandForecastResponse(BaseModel):
    zone_id: str
    service_category: str
    forecast_date: str
    predicted_demand: int
    current_available_workers: int
    workforce_gap: int
    peak_hours: List[str]
    explainability: str
    feature_importance: dict
