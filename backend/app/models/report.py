import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ReportRecord(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    report_pdf_path = Column(String(500), nullable=False)
    access_token = Column(String(100), unique=True, index=True, default=generate_uuid)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    assessment = relationship("Assessment", back_populates="reports")

class DoctorPatientAccess(Base):
    __tablename__ = "doctor_patient_access"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="APPROVED")  # PENDING, APPROVED, REVOKED
    consented_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    doctor = relationship("Doctor", back_populates="patient_accesses")
    patient = relationship("PatientProfile", back_populates="doctor_accesses")
