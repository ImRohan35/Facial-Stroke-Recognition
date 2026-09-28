from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class RecoveryLogCreate(BaseModel):
    record_date: Optional[date] = None
    facial_movement_score: Optional[float] = None
    speech_practice_minutes: int = 0
    exercise_completed: bool = True
    therapist_goals: Optional[str] = None
    patient_notes: Optional[str] = None

class RecoveryRecordOut(BaseModel):
    id: str
    patient_id: str
    record_date: date
    facial_movement_score: Optional[float] = None
    speech_practice_minutes: int
    exercise_completed: bool
    therapist_goals: Optional[str] = None
    patient_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SymptomEventCreate(BaseModel):
    symptom_category: str  # FACE, EYE, BALANCE, ARM, SPEECH, TIME
    symptom_started_at: datetime
    description: Optional[str] = None
    emergency_mode_engaged: bool = False

class SymptomEventOut(BaseModel):
    id: str
    patient_id: str
    symptom_category: str
    symptom_started_at: datetime
    description: Optional[str] = None
    emergency_mode_engaged: bool
    created_at: datetime

    class Config:
        from_attributes = True
