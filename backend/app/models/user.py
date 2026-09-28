import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="PATIENT")  # PATIENT, DOCTOR, ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    baseline_assessment_id = Column(String(36), nullable=True)
    reminder_enabled = Column(Boolean, default=False)
    reminder_frequency = Column(String(50), default="WEEKLY")
    reminder_time = Column(String(20), default="09:00")
    data_sharing_consent = Column(Boolean, default=False)
    research_consent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    assessments = relationship("Assessment", back_populates="patient", cascade="all, delete-orphan")
    baseline_records = relationship("BaselineAssessment", back_populates="patient", cascade="all, delete-orphan")
    comparison_records = relationship("ComparisonRecord", back_populates="patient", cascade="all, delete-orphan")
    monitoring_records = relationship("MonitoringRecord", back_populates="patient", cascade="all, delete-orphan")
    doctor_accesses = relationship("DoctorPatientAccess", back_populates="patient", cascade="all, delete-orphan")
    risk_factors = relationship("RiskFactorRecord", back_populates="patient", cascade="all, delete-orphan")
    recovery_records = relationship("RecoveryRecord", back_populates="patient", cascade="all, delete-orphan")
    symptom_events = relationship("SymptomEvent", back_populates="patient", cascade="all, delete-orphan")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    license_number = Column(String(100), nullable=False)
    hospital_affiliation = Column(String(255), nullable=True)
    specialty = Column(String(100), default="Neurology / Clinical Facial Asymmetry Screening")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    patient_accesses = relationship("DoctorPatientAccess", back_populates="doctor", cascade="all, delete-orphan")
