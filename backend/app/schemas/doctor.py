from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DoctorPatientAccessCreate(BaseModel):
    doctor_license: str

class PatientOverviewOut(BaseModel):
    patient_id: str
    user_id: str
    full_name: str
    email: str
    latest_assessment_date: Optional[datetime] = None
    latest_symmetry_score: Optional[float] = None
    latest_classification: Optional[str] = None
    attention_risk_count: int = 0
    flagged_risk_factors: List[str] = []
    has_baseline: bool = False
    access_status: str

    class Config:
        from_attributes = True
  