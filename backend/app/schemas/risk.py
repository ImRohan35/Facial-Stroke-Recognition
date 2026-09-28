from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RiskFactorInput(BaseModel):
    age: int = Field(..., ge=1, le=120)
    hypertension: bool = False
    heart_disease: bool = False
    diabetes: bool = False
    smoking_status: str = "never"  # never, formerly, current
    physical_activity: str = "moderate"  # low, moderate, high
    bmi: Optional[float] = Field(None, ge=10.0, le=70.0)
    avg_glucose_level: Optional[float] = Field(None, ge=40.0, le=400.0)
    family_stroke_history: bool = False
    prior_transient_ischemic_attack: bool = False

class RiskFactorOut(BaseModel):
    id: str
    patient_id: str
    age: int
    hypertension: bool
    heart_disease: bool
    diabetes: bool
    smoking_status: str
    physical_activity: str
    bmi: Optional[float] = None
    avg_glucose_level: Optional[float] = None
    family_stroke_history: bool
    prior_transient_ischemic_attack: bool
    attention_risk_count: int
    flagged_factors: List[str]
    educational_advice: str
    created_at: datetime

    class Config:
        from_attributes = True
