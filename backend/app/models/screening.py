import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version_id = Column(String(36), ForeignKey("model_versions.id", ondelete="SET NULL"), nullable=True)
    assessment_type = Column(String(30), default="UPLOAD")  # UPLOAD, LIVE_CAMERA, GUIDED_VIDEO, MULTI_IMAGE
    quality_status = Column(String(20), default="PASSED")  # PASSED, WARNING, REJECTED
    authenticity_status = Column(String(50), default="VALID")  # VALID, LOW_QUALITY, MANIPULATION_SUSPECTED, MULTIPLE_FACES, UNCERTAIN
    reliability_score = Column(Float, default=85.0)
    reliability_category = Column(String(20), default="HIGH")  # HIGH, MEDIUM, LOW
    quality_metrics = Column(JSON, nullable=True)
    image_path = Column(String(500), nullable=True)
    annotated_image_path = Column(String(500), nullable=True)
    is_baseline = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    patient = relationship("PatientProfile", back_populates="assessments")
    facial_features = relationship("FacialFeatures", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    landmarks = relationship("Landmarks", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    model_prediction = relationship("ModelPrediction", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    xai_result = relationship("XaiResult", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    reports = relationship("ReportRecord", back_populates="assessment", cascade="all, delete-orphan")
    model_version = relationship("ModelVersion", back_populates="assessments")

class FacialFeatures(Base):
    __tablename__ = "facial_features"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # 0 - 100 Clinical Symmetry Indices
    facial_symmetry = Column(Float, nullable=False, default=100.0)
    eye_symmetry = Column(Float, nullable=False, default=100.0)
    eyebrow_symmetry = Column(Float, nullable=False, default=100.0)
    mouth_symmetry = Column(Float, nullable=False, default=100.0)
    nose_alignment = Column(Float, nullable=False, default=100.0)
    jaw_symmetry = Column(Float, nullable=False, default=100.0)
    
    # Raw geometric asymmetry magnitudes
    lower_face_asymmetry = Column(Float, nullable=False, default=0.0)
    landmark_displacement_mean = Column(Float, nullable=False, default=0.0)
    
    feature_vector = Column(JSON, nullable=True)
    feature_names = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    assessment = relationship("Assessment", back_populates="facial_features")

class Landmarks(Base):
    __tablename__ = "landmarks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    total_points = Column(Integer, default=468)
    key_landmarks = Column(JSON, nullable=True)  # UI landmarks subset for fast canvas rendering
    normalized_points = Column(JSON, nullable=True)
    bilateral_pairs = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    assessment = relationship("Assessment", back_populates="landmarks")

class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Prediction state: stroke_associated, non_stroke_associated, uncertain
    prediction = Column(String(50), nullable=False)
    model_confidence = Column(Float, nullable=False)
    raw_stroke_probability = Column(Float, nullable=True)
    model_version = Column(String(50), default="v1.0")
    algorithm_used = Column(String(50), default="XGBoost")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    assessment = relationship("Assessment", back_populates="model_prediction")

class XaiResult(Base):
    __tablename__ = "xai_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    method = Column(String(50), default="SHAP")
    top_contributing_features = Column(JSON, nullable=True)  # [{"feature": "mouth_asymmetry", "importance": 0.42, "contribution": "High"}]
    explanation_summary = Column(Text, nullable=True)
    shap_values = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    assessment = relationship("Assessment", back_populates="xai_result")

class BaselineAssessment(Base):
    __tablename__ = "baseline_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    
    reference_image_path = Column(String(500), nullable=True)
    facial_symmetry = Column(Float, nullable=False)
    eye_symmetry = Column(Float, nullable=False)
    eyebrow_symmetry = Column(Float, nullable=False)
    mouth_symmetry = Column(Float, nullable=False)
    nose_alignment = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    patient = relationship("PatientProfile", back_populates="baseline_records")

class ComparisonRecord(Base):
    __tablename__ = "comparison_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    baseline_assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    current_assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    
    # Deltas (current - baseline)
    facial_symmetry_delta = Column(Float, nullable=False)
    eye_symmetry_delta = Column(Float, nullable=False)
    eyebrow_symmetry_delta = Column(Float, nullable=False)
    mouth_symmetry_delta = Column(Float, nullable=False)
    nose_alignment_delta = Column(Float, nullable=False)
    
    interpretation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    patient = relationship("PatientProfile", back_populates="comparison_records")

class MonitoringRecord(Base):
    __tablename__ = "monitoring_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    
    recorded_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    facial_symmetry = Column(Float, nullable=False)
    eye_symmetry = Column(Float, nullable=False)
    eyebrow_symmetry = Column(Float, nullable=False)
    mouth_symmetry = Column(Float, nullable=False)
    nose_alignment = Column(Float, nullable=False)
    overall_asymmetry = Column(Float, nullable=False)
    prediction_state = Column(String(50), nullable=True)
    reliability_score = Column(Float, default=85.0)
    reliability_category = Column(String(20), default="HIGH")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    patient = relationship("PatientProfile", back_populates="monitoring_records")
