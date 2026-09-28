from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QualityCheckResponse(BaseModel):
    passed: bool
    status: str
    message: str
    issues: List[str]
    warnings: List[str]
    metrics: Dict[str, Any]

class FacialFeaturesOut(BaseModel):
    facial_symmetry_score: float
    eye_opening_symmetry: float
    eyebrow_height_symmetry: float
    mouth_corner_symmetry: float
    lower_face_asymmetry: float
    landmark_displacement_mean: float
    landmarks_2d: Optional[List[Dict[str, Any]]] = None

class ScreeningResultOut(BaseModel):
    classification: str
    confidence_score: float
    shap_feature_contributions: Optional[List[Dict[str, Any]]] = None
    clinical_summary_notes: Optional[str] = None
    emergency_alert_triggered: bool

class AssessmentOut(BaseModel):
    id: str
    patient_id: str
    assessment_type: str
    quality_status: str
    quality_metrics: Optional[Dict[str, Any]] = None
    is_baseline: bool
    image_url: Optional[str] = None
    annotated_image_url: Optional[str] = None
    created_at: datetime
    facial_features: Optional[FacialFeaturesOut] = None
    screening_result: Optional[ScreeningResultOut] = None
    baseline_diff: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class SetBaselineResponse(BaseModel):
    success: bool
    message: str
    baseline_assessment_id: str
