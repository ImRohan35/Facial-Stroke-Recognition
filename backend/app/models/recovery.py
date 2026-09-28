import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RecoveryRecord(Base):
    __tablename__ = "recovery_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    record_date = Column(Date, default=date.today)
    
    facial_movement_score = Column(Float, nullable=True)  # measured via exercise/assessment
    speech_practice_minutes = Column(Integer, default=0)
    exercise_completed = Column(Boolean, default=False)
    therapist_goals = Column(Text, nullable=True)
    patient_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    patient = relationship("PatientProfile", back_populates="recovery_records")

class SymptomEvent(Base):
    __tablename__ = "symptom_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    
    symptom_category = Column(String(50), nullable=False)  # FACE, EYE, BALANCE, ARM, SPEECH, TIME
    symptom_started_at = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    emergency_mode_engaged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    patient = relationship("PatientProfile", back_populates="symptom_events")
