import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RiskFactorRecord(Base):
    __tablename__ = "risk_factors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    
    age = Column(Integer, nullable=False)
    hypertension = Column(Boolean, default=False)
    heart_disease = Column(Boolean, default=False)
    diabetes = Column(Boolean, default=False)
    smoking_status = Column(String(50), default="never")  # never, formerly, current
    physical_activity = Column(String(50), default="moderate")  # low, moderate, high
    bmi = Column(Float, nullable=True)
    avg_glucose_level = Column(Float, nullable=True)
    family_stroke_history = Column(Boolean, default=False)
    prior_transient_ischemic_attack = Column(Boolean, default=False)
    
    # Risk factor synthesis
    attention_risk_count = Column(Integer, default=0)
    flagged_factors = Column(JSON, nullable=True)  # List of identified factors requiring medical discussion
    educational_advice = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    patient = relationship("PatientProfile", back_populates="risk_factors")
