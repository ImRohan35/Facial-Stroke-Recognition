import os
import uuid
import cv2
import numpy as np
import base64
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_patient, get_current_patient_optional
from app.models.user import User, PatientProfile
from app.models.screening import (
    Assessment,
    FacialFeatures,
    Landmarks,
    ModelPrediction,
    XaiResult,
    BaselineAssessment,
    ComparisonRecord,
    MonitoringRecord
)
from app.models.system import AuditLog
from app.ml.quality import check_image_quality
from app.ml.validation import validate_image_authenticity_and_quality
from app.ml.feature_extraction import FaceMeshExtractor, extract_distance_invariant_features
from app.ml.models import model_service
from app.ml.annotator import annotate_face_landmarks
from app.ml.video_analyzer import analyze_video_frames

EMERGENCY_CARE_DISCLAIMER = (
    "Important: This AI system analyzes facial patterns associated with the classes represented in its training data. "
    "It is an AI-assisted research and screening tool and NOT a clinical diagnostic device. If you or someone you are evaluating "
    "is experiencing acute neurological symptoms, sudden facial droop, arm weakness, speech difficulty, or severe sudden headache, "
    "please seek emergency medical care (call emergency services or proceed to the nearest emergency department) immediately."
)

router = APIRouter(prefix="", tags=["Screening & Analysis"])

mesh_extractor = FaceMeshExtractor(static_image_mode=True, max_num_faces=2)

def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    try:
        from PIL import Image, ImageOps
        import io
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
        rgb_arr = np.array(pil_img)
        img = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
    except Exception:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format or corrupted file.")

    h, w = img.shape[:2]
    max_dim = 1600
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    return img

def extract_landmarks_robust(img_bgr: np.ndarray):
    faces = mesh_extractor.extract_landmarks(img_bgr)
    if faces and len(faces) > 0:
        return img_bgr, faces

    for rot in [cv2.ROTATE_90_CLOCKWISE, cv2.ROTATE_180, cv2.ROTATE_90_COUNTERCLOCKWISE]:
        rotated = cv2.rotate(img_bgr, rot)
        faces = mesh_extractor.extract_landmarks(rotated)
        if faces and len(faces) > 0:
            return rotated, faces

    return img_bgr, []

@router.get("/screening/sample-cases")
def get_sample_cases():
    """
    Returns verified dataset samples (Stroke vs Non-Stroke)
    allowing users/evaluators to immediately test both conditions.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    dataset_dir = os.path.join(base_dir, "ml_pipeline", "dataset")

    samples = [
        {
            "id": "stroke_sample_1",
            "title": "Clinical Case #1: Unilateral Mouth Corner Droop",
            "description": "Patient exhibiting acute unilateral oral asymmetry and commissure tilt.",
            "expected_prediction": "stroke_associated",
            "filename": "img_0023.jpg",
            "folder": "Stroke"
        },
        {
            "id": "stroke_sample_2",
            "title": "Clinical Case #2: Lower Facial Asymmetry",
            "description": "Significant lower mandibular asymmetry and unilateral landmark displacement.",
            "expected_prediction": "stroke_associated",
            "filename": "img_0026.jpg",
            "folder": "Stroke"
        },
        {
            "id": "control_sample_1",
            "title": "Control Case #1: Balanced Bilateral Alignment",
            "description": "Control individual with symmetric oral corners, balanced eye aperture and aligned nasal bridge.",
            "expected_prediction": "non_stroke_associated",
            "filename": "img_0001.jpg",
            "folder": "NonStroke"
        },
        {
            "id": "control_sample_2",
            "title": "Control Case #2: Normal Physiological Symmetry",
            "description": "Control individual within normal physiological bilateral landmark tolerances.",
            "expected_prediction": "non_stroke_associated",
            "filename": "img_0005.jpg",
            "folder": "NonStroke"
        }
    ]

    for s in samples:
        fpath = os.path.join(dataset_dir, s["folder"], s["filename"])
        if os.path.exists(fpath):
            try:
                with open(fpath, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode("utf-8")
                    s["image_base64"] = f"data:image/jpeg;base64,{b64}"
            except Exception:
                s["image_base64"] = None
        else:
            s["image_base64"] = None

    return {"samples": samples}

@router.post("/screening/image")
async def analyze_image_endpoint(
    image: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    assessment_type: str = Form("UPLOAD"),  # UPLOAD, LIVE_CAMERA
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """
    Core Image Screening Pipeline matching Section 31:
    - Decodes image
    - Quality Validation
    - MediaPipe Face Landmarker
    - Facial Feature Extraction (Eye, Eyebrow, Mouth, Nose, Jaw, Overall)
    - Machine Learning Inference
    - Explainable AI (SHAP)
    - Saves Assessment, Features, Landmarks, Predictions, and Monitoring records
    """
    image_bytes = None
    if image is not None:
        image_bytes = await image.read()
    elif image_base64:
        header_split = image_base64.split(",")
        raw_b64 = header_split[1] if len(header_split) > 1 else header_split[0]
        image_bytes = base64.b64decode(raw_b64)

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image file or base64 payload provided.")

    img = decode_image_bytes(image_bytes)
    oriented_img, faces = extract_landmarks_robust(img)
    
    # 1. Comprehensive Image Authenticity & Quality Validation
    validation = validate_image_authenticity_and_quality(oriented_img, faces)
    if not validation["is_valid"]:
        return {
            "prediction": "uncertain",
            "prediction_display": f"Unable to Reliably Assess ({validation['message']})",
            "model_confidence": 0.50,
            "authenticity_status": validation["authenticity_status"],
            "validation_status": validation["validation_status"],
            "quality_status": "REJECTED",
            "message": validation["message"],
            "reliability_score": validation["reliability_score"],
            "reliability_category": validation["reliability_category"],
            "reliability_factors": validation["reliability_factors"],
            "warnings": validation["warnings"],
            "is_forced_expression": validation["is_forced_expression"],
            "manipulation_suspected": validation["manipulation_suspected"],
            "facial_features": None,
            "explanation": [],
            "disclaimer": EMERGENCY_CARE_DISCLAIMER
        }

    # 2. Extract Features
    landmarks_raw = faces[0]
    features_dict = extract_distance_invariant_features(landmarks_raw)
    
    # 3. ML Model Prediction & Explainable AI (with forced expression & reliability checks)
    ml_output = model_service.predict_and_explain(
        features_dict["feature_vector"],
        is_forced_expression=validation["is_forced_expression"],
        reliability_category=validation["reliability_category"]
    )

    # 4. Save Image & Annotated Mesh Artifacts
    unique_id = str(uuid.uuid4())
    img_filename = f"scan_{unique_id}.jpg"
    annotated_filename = f"scan_{unique_id}_annotated.jpg"
    
    img_path = os.path.join(settings.UPLOAD_DIR, img_filename)
    annotated_path = os.path.join(settings.UPLOAD_DIR, annotated_filename)
    
    cv2.imwrite(img_path, oriented_img)
    annotated_img = annotate_face_landmarks(oriented_img, landmarks_raw, features_dict)
    cv2.imwrite(annotated_path, annotated_img)

    # 5. Persist to Database if patient is logged in
    assessment_id = unique_id
    if current_patient:
        patient_id = current_patient.id
    elif user_id:
        patient_profile = db.query(PatientProfile).filter(
            (PatientProfile.user_id == user_id) | (PatientProfile.id == user_id)
        ).first()
        patient_id = patient_profile.id if patient_profile else None
    else:
        demo_patient = db.query(PatientProfile).first()
        patient_id = demo_patient.id if demo_patient else None

    if patient_id:
        new_assessment = Assessment(
            id=unique_id,
            patient_id=patient_id,
            assessment_type=assessment_type,
            quality_status="PASSED",
            authenticity_status=validation["authenticity_status"],
            reliability_score=validation["reliability_score"],
            reliability_category=validation["reliability_category"],
            quality_metrics=validation.get("reliability_factors"),
            image_path=f"/uploads/{img_filename}",
            annotated_image_path=f"/uploads/{annotated_filename}"
        )
        db.add(new_assessment)

        # Facial Features table
        db_features = FacialFeatures(
            assessment_id=unique_id,
            facial_symmetry=features_dict["facial_symmetry"],
            eye_symmetry=features_dict["eye_symmetry"],
            eyebrow_symmetry=features_dict["eyebrow_symmetry"],
            mouth_symmetry=features_dict["mouth_symmetry"],
            nose_alignment=features_dict["nose_alignment"],
            jaw_symmetry=features_dict["jaw_symmetry"],
            lower_face_asymmetry=features_dict["lower_face_asymmetry"],
            landmark_displacement_mean=features_dict["landmark_displacement_mean"],
            feature_vector=features_dict["feature_vector"],
            feature_names=features_dict["feature_names"]
        )
        db.add(db_features)

        # Landmarks table
        db_landmarks = Landmarks(
            assessment_id=unique_id,
            total_points=len(landmarks_raw),
            key_landmarks=features_dict["ui_landmarks"]
        )
        db.add(db_landmarks)

        # Model Predictions table
        db_prediction = ModelPrediction(
            assessment_id=unique_id,
            prediction=ml_output["prediction"],
            model_confidence=ml_output["model_confidence"],
            raw_stroke_probability=ml_output.get("raw_stroke_probability"),
            model_version=ml_output["model_version"],
            algorithm_used=ml_output["algorithm_used"]
        )
        db.add(db_prediction)

        # XAI Results table
        db_xai = XaiResult(
            assessment_id=unique_id,
            method="SHAP",
            top_contributing_features=ml_output["explanation"],
            explanation_summary=ml_output["summary_text"],
            shap_values=ml_output.get("all_shap_contributions")
        )
        db.add(db_xai)

        # Monitoring Records table (for longitudinal Recharts)
        db_monitoring = MonitoringRecord(
            patient_id=patient_id,
            assessment_id=unique_id,
            facial_symmetry=features_dict["facial_symmetry"],
            eye_symmetry=features_dict["eye_symmetry"],
            eyebrow_symmetry=features_dict["eyebrow_symmetry"],
            mouth_symmetry=features_dict["mouth_symmetry"],
            nose_alignment=features_dict["nose_alignment"],
            overall_asymmetry=round(100.0 - features_dict["facial_symmetry"], 1),
            prediction_state=ml_output["prediction"],
            reliability_score=validation["reliability_score"],
            reliability_category=validation["reliability_category"]
        )
        db.add(db_monitoring)

        # Audit Log
        db_log = AuditLog(
            user_id=current_patient.user_id if current_patient else None,
            action="ASSESSMENT_COMPLETED",
            resource_type="Assessment",
            resource_id=unique_id,
            details={"prediction": ml_output["prediction"], "confidence": ml_output["model_confidence"]}
        )
        db.add(db_log)
        db.commit()

    # Exact response structure matching Section 31 + anti-manipulation & reliability fields
    return {
        "prediction": ml_output["prediction"],
        "prediction_display": ml_output["prediction_display"],
        "model_confidence": ml_output["model_confidence"],
        "input_reliability": {
            "score": validation["reliability_score"],
            "category": validation["reliability_category"],
            "authenticity_status": validation["authenticity_status"],
            "is_forced_expression": validation["is_forced_expression"],
            "manipulation_suspected": validation["manipulation_suspected"],
            "factors": validation["reliability_factors"],
            "warnings": validation["warnings"]
        },
        "facial_features": {
            "facial_symmetry": features_dict["facial_symmetry"],
            "eye_symmetry": features_dict["eye_symmetry"],
            "eyebrow_symmetry": features_dict["eyebrow_symmetry"],
            "mouth_symmetry": features_dict["mouth_symmetry"],
            "nose_alignment": features_dict["nose_alignment"],
            "jaw_symmetry": features_dict["jaw_symmetry"]
        },
        "explanation": ml_output["explanation"],
        "model_version": ml_output["model_version"],
        "assessment_id": unique_id,
        "image_url": f"/uploads/{img_filename}",
        "annotated_image_url": f"/uploads/{annotated_filename}",
        "ui_landmarks": features_dict["ui_landmarks"],
        "summary_text": ml_output["summary_text"],
        "quality_status": "PASSED",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": EMERGENCY_CARE_DISCLAIMER
    }

@router.post("/screening/video")
async def analyze_video_endpoint(
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """
    Video Screening Endpoint with Facial Landmark Sequence Analysis:
    - Extracts frame-by-frame landmarks
    - Calculates temporal dynamics (velocity, movement range, temporal asymmetry)
    - Runs ML inference on representative peak asymmetry frame
    """
    unique_id = str(uuid.uuid4())
    video_filename = f"video_{unique_id}.webm"
    video_path = os.path.join(settings.UPLOAD_DIR, video_filename)

    with open(video_path, "wb") as f:
        content = await video.read()
        f.write(content)

    video_analysis = analyze_video_frames(video_path, max_frames=50)
    if not video_analysis.get("success"):
        raise HTTPException(
            status_code=400,
            detail=video_analysis.get("error", "Failed to track facial landmarks in video frames.")
        )

    # ML Inference on peak asymmetry frame
    rep_features = video_analysis["representative_features"]
    ml_output = model_service.predict_and_explain(rep_features["feature_vector"])

    # Persist assessment record
    patient_id = current_patient.id if current_patient else None
    if not patient_id:
        demo_patient = db.query(PatientProfile).first()
        patient_id = demo_patient.id if demo_patient else None

    if patient_id:
        new_assessment = Assessment(
            id=unique_id,
            patient_id=patient_id,
            assessment_type="GUIDED_VIDEO",
            quality_status="PASSED",
            image_path=f"/uploads/{video_filename}"
        )
        db.add(new_assessment)

        db_features = FacialFeatures(
            assessment_id=unique_id,
            facial_symmetry=video_analysis["sequence_averages"]["facial_symmetry"],
            eye_symmetry=video_analysis["sequence_averages"]["eye_symmetry"],
            eyebrow_symmetry=video_analysis["sequence_averages"]["eyebrow_symmetry"],
            mouth_symmetry=video_analysis["sequence_averages"]["mouth_symmetry"],
            nose_alignment=video_analysis["sequence_averages"]["nose_alignment"],
            jaw_symmetry=rep_features["jaw_symmetry"],
            feature_vector=rep_features["feature_vector"]
        )
        db.add(db_features)

        db_prediction = ModelPrediction(
            assessment_id=unique_id,
            prediction=ml_output["prediction"],
            model_confidence=ml_output["model_confidence"],
            model_version=ml_output["model_version"],
            algorithm_used=ml_output["algorithm_used"]
        )
        db.add(db_prediction)

        db_xai = XaiResult(
            assessment_id=unique_id,
            method="SHAP + Temporal Analysis",
            top_contributing_features=ml_output["explanation"],
            explanation_summary=ml_output["summary_text"]
        )
        db.add(db_xai)

        db_monitoring = MonitoringRecord(
            patient_id=patient_id,
            assessment_id=unique_id,
            facial_symmetry=video_analysis["sequence_averages"]["facial_symmetry"],
            eye_symmetry=video_analysis["sequence_averages"]["eye_symmetry"],
            eyebrow_symmetry=video_analysis["sequence_averages"]["eyebrow_symmetry"],
            mouth_symmetry=video_analysis["sequence_averages"]["mouth_symmetry"],
            nose_alignment=video_analysis["sequence_averages"]["nose_alignment"],
            overall_asymmetry=round(100.0 - video_analysis["sequence_averages"]["facial_symmetry"], 1),
            prediction_state=ml_output["prediction"]
        )
        db.add(db_monitoring)
        db.commit()

    return {
        "assessment_id": unique_id,
        "prediction": ml_output["prediction"],
        "prediction_display": ml_output["prediction_display"],
        "model_confidence": ml_output["model_confidence"],
        "facial_features": video_analysis["sequence_averages"],
        "temporal_features": video_analysis["temporal_features"],
        "frame_sequence": video_analysis["frame_sequence"][:30],
        "explanation": ml_output["explanation"],
        "summary_text": ml_output["summary_text"],
        "model_version": ml_output["model_version"],
        "total_frames_analyzed": video_analysis["total_frames_analyzed"],
        "video_duration_seconds": video_analysis["video_duration_seconds"]
    }

@router.get("/assessments")
def get_assessments(
    patient_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Retrieves list of past assessments for the user or requested patient."""
    pid = patient_id or (current_patient.id if current_patient else None)
    if not pid:
        demo_patient = db.query(PatientProfile).first()
        pid = demo_patient.id if demo_patient else None

    query = db.query(Assessment).filter(Assessment.patient_id == pid).order_by(Assessment.created_at.desc())
    items = query.limit(limit).all()

    results = []
    for a in items:
        feats = a.facial_features
        pred = a.model_prediction
        results.append({
            "id": a.id,
            "assessment_type": a.assessment_type,
            "created_at": a.created_at.isoformat(),
            "quality_status": a.quality_status,
            "authenticity_status": getattr(a, "authenticity_status", "VALID"),
            "reliability_score": getattr(a, "reliability_score", 85.0),
            "reliability_category": getattr(a, "reliability_category", "HIGH"),
            "image_url": a.image_path,
            "annotated_image_url": a.annotated_image_path,
            "is_baseline": a.is_baseline,
            "facial_features": {
                "facial_symmetry": feats.facial_symmetry if feats else None,
                "eye_symmetry": feats.eye_symmetry if feats else None,
                "eyebrow_symmetry": feats.eyebrow_symmetry if feats else None,
                "mouth_symmetry": feats.mouth_symmetry if feats else None,
                "nose_alignment": feats.nose_alignment if feats else None,
                "jaw_symmetry": feats.jaw_symmetry if feats else None,
            } if feats else None,
            "prediction": pred.prediction if pred else "non_stroke_associated",
            "model_confidence": pred.model_confidence if pred else 0.85,
            "model_version": pred.model_version if pred else "v1.0"
        })

    return {"assessments": results, "total": len(results)}

@router.get("/assessments/{assessment_id}")
def get_assessment_by_id(assessment_id: str, db: Session = Depends(get_db)):
    """Retrieves full details of a specific assessment."""
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    feats = a.facial_features
    lms = a.landmarks
    pred = a.model_prediction
    xai = a.xai_result

    return {
        "id": a.id,
        "patient_id": a.patient_id,
        "assessment_type": a.assessment_type,
        "quality_status": a.quality_status,
        "authenticity_status": getattr(a, "authenticity_status", "VALID"),
        "input_reliability": {
            "score": getattr(a, "reliability_score", 85.0),
            "category": getattr(a, "reliability_category", "HIGH"),
            "authenticity_status": getattr(a, "authenticity_status", "VALID")
        },
        "created_at": a.created_at.isoformat(),
        "image_url": a.image_path,
        "annotated_image_url": a.annotated_image_path,
        "is_baseline": a.is_baseline,
        "facial_features": {
            "facial_symmetry": feats.facial_symmetry if feats else None,
            "eye_symmetry": feats.eye_symmetry if feats else None,
            "eyebrow_symmetry": feats.eyebrow_symmetry if feats else None,
            "mouth_symmetry": feats.mouth_symmetry if feats else None,
            "nose_alignment": feats.nose_alignment if feats else None,
            "jaw_symmetry": feats.jaw_symmetry if feats else None,
            "lower_face_asymmetry": feats.lower_face_asymmetry if feats else 0.0,
            "landmark_displacement_mean": feats.landmark_displacement_mean if feats else 0.0
        } if feats else None,
        "ui_landmarks": lms.key_landmarks if lms else [],
        "prediction": pred.prediction if pred else "non_stroke_associated",
        "model_confidence": pred.model_confidence if pred else 0.85,
        "model_version": pred.model_version if pred else "v1.0",
        "algorithm_used": pred.algorithm_used if pred else "XGBoost",
        "explanation": xai.top_contributing_features if xai else [],
        "summary_text": xai.explanation_summary if xai else "",
        "disclaimer": EMERGENCY_CARE_DISCLAIMER
    }

from pydantic import BaseModel

class AssistantQuestionRequest(BaseModel):
    question: str
    assessment_id: Optional[str] = None
    prediction: Optional[str] = None
    facial_symmetry: Optional[float] = None
    mouth_symmetry: Optional[float] = None
    eye_symmetry: Optional[float] = None
    model_confidence: Optional[float] = None

class ReminderSettingsRequest(BaseModel):
    reminder_enabled: bool
    reminder_frequency: str = "WEEKLY"  # DAILY, WEEKLY, BIWEEKLY, MONTHLY
    reminder_time: str = "09:00"

class PrivacyConsentRequest(BaseModel):
    data_sharing_consent: bool
    research_consent: bool

@router.delete("/assessments/{assessment_id}")
def delete_assessment(
    assessment_id: str,
    delete_image_files: bool = Query(True),
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Deletes an assessment and cleanly purges stored image files from disk (Privacy Center)."""
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if delete_image_files:
        for p in [a.image_path, a.annotated_image_path]:
            if p and p.startswith("/uploads/"):
                fname = os.path.basename(p)
                fpath = os.path.join(settings.UPLOAD_DIR, fname)
                if os.path.exists(fpath):
                    try:
                        os.remove(fpath)
                    except Exception:
                        pass

    db.delete(a)
    db.commit()
    return {"success": True, "message": "Assessment and associated image files deleted successfully."}

@router.post("/screening/multi-image")
async def analyze_multi_image_endpoint(
    neutral_image: UploadFile = File(...),
    smile_image: Optional[UploadFile] = File(None),
    eye_image: Optional[UploadFile] = File(None),
    additional_image: Optional[UploadFile] = File(None),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """
    Multi-Image Assessment Session:
    Combines resting neutral face with optional dynamic smile and ocular views.
    Each image independently undergoes quality and anti-manipulation checks.
    """
    neutral_bytes = await neutral_image.read()
    neutral_img = decode_image_bytes(neutral_bytes)
    neutral_oriented, neutral_faces = extract_landmarks_robust(neutral_img)
    neutral_val = validate_image_authenticity_and_quality(neutral_oriented, neutral_faces)

    if not neutral_val["is_valid"]:
        return {
            "prediction": "uncertain",
            "prediction_display": f"Unable to Reliably Assess ({neutral_val['message']})",
            "model_confidence": 0.50,
            "authenticity_status": neutral_val["authenticity_status"],
            "reliability_score": neutral_val["reliability_score"],
            "reliability_category": neutral_val["reliability_category"],
            "message": f"Neutral baseline photo: {neutral_val['message']}",
            "disclaimer": EMERGENCY_CARE_DISCLAIMER
        }

    neutral_features = extract_distance_invariant_features(neutral_faces[0])

    processed_views = [{
        "view": "neutral",
        "reliability_score": neutral_val["reliability_score"],
        "facial_symmetry": neutral_features["facial_symmetry"],
        "mouth_symmetry": neutral_features["mouth_symmetry"],
        "eye_symmetry": neutral_features["eye_symmetry"]
    }]

    smile_features = None
    if smile_image is not None:
        try:
            s_bytes = await smile_image.read()
            s_img = decode_image_bytes(s_bytes)
            s_orient, s_faces = extract_landmarks_robust(s_img)
            s_val = validate_image_authenticity_and_quality(s_orient, s_faces)
            if s_val["is_valid"]:
                smile_features = extract_distance_invariant_features(s_faces[0])
                processed_views.append({
                    "view": "smile",
                    "reliability_score": s_val["reliability_score"],
                    "facial_symmetry": smile_features["facial_symmetry"],
                    "mouth_symmetry": smile_features["mouth_symmetry"],
                    "eye_symmetry": smile_features["eye_symmetry"]
                })
        except Exception:
            pass

    eye_features = None
    if eye_image is not None:
        try:
            e_bytes = await eye_image.read()
            e_img = decode_image_bytes(e_bytes)
            e_orient, e_faces = extract_landmarks_robust(e_img)
            e_val = validate_image_authenticity_and_quality(e_orient, e_faces)
            if e_val["is_valid"]:
                eye_features = extract_distance_invariant_features(e_faces[0])
                processed_views.append({
                    "view": "eye",
                    "reliability_score": e_val["reliability_score"],
                    "facial_symmetry": eye_features["facial_symmetry"],
                    "mouth_symmetry": eye_features["mouth_symmetry"],
                    "eye_symmetry": eye_features["eye_symmetry"]
                })
        except Exception:
            pass

    # Multi-view Feature Pooling (resting structural baseline + dynamic activation delta)
    pooled_vector = list(neutral_features["feature_vector"])
    if smile_features:
        if smile_features["mouth_symmetry"] < neutral_features["mouth_symmetry"]:
            pooled_vector[0] = max(pooled_vector[0], smile_features["feature_vector"][0])
            pooled_vector[1] = max(pooled_vector[1], smile_features["feature_vector"][1])
            pooled_vector[2] = max(pooled_vector[2], smile_features["feature_vector"][2])
            pooled_vector[7] = min(pooled_vector[7], smile_features["mouth_symmetry"])

    if eye_features:
        if eye_features["eye_symmetry"] < neutral_features["eye_symmetry"]:
            pooled_vector[3] = max(pooled_vector[3], eye_features["feature_vector"][3])
            pooled_vector[8] = min(pooled_vector[8], eye_features["eye_symmetry"])

    ml_output = model_service.predict_and_explain(
        pooled_vector,
        is_forced_expression=neutral_val["is_forced_expression"],
        reliability_category=neutral_val["reliability_category"]
    )

    unique_id = str(uuid.uuid4())
    img_filename = f"multi_{unique_id}.jpg"
    annotated_filename = f"multi_{unique_id}_annotated.jpg"
    img_path = os.path.join(settings.UPLOAD_DIR, img_filename)
    annotated_path = os.path.join(settings.UPLOAD_DIR, annotated_filename)
    cv2.imwrite(img_path, neutral_oriented)
    annotated_img = annotate_face_landmarks(neutral_oriented, neutral_faces[0], neutral_features)
    cv2.imwrite(annotated_path, annotated_img)

    patient_id = current_patient.id if current_patient else None
    if not patient_id:
        demo_patient = db.query(PatientProfile).first()
        patient_id = demo_patient.id if demo_patient else None

    if patient_id:
        mean_rel = round(float(np.mean([v["reliability_score"] for v in processed_views])), 1)
        new_assessment = Assessment(
            id=unique_id,
            patient_id=patient_id,
            assessment_type="MULTI_IMAGE",
            quality_status="PASSED",
            authenticity_status=neutral_val["authenticity_status"],
            reliability_score=mean_rel,
            reliability_category=neutral_val["reliability_category"],
            quality_metrics={"views_analyzed": len(processed_views)},
            image_path=f"/uploads/{img_filename}",
            annotated_image_path=f"/uploads/{annotated_filename}"
        )
        db.add(new_assessment)
        db_features = FacialFeatures(
            assessment_id=unique_id,
            facial_symmetry=round(float(np.mean([v["facial_symmetry"] for v in processed_views])), 1),
            eye_symmetry=min([v["eye_symmetry"] for v in processed_views]),
            eyebrow_symmetry=neutral_features["eyebrow_symmetry"],
            mouth_symmetry=min([v["mouth_symmetry"] for v in processed_views]),
            nose_alignment=neutral_features["nose_alignment"],
            jaw_symmetry=neutral_features["jaw_symmetry"],
            feature_vector=pooled_vector,
            feature_names=neutral_features["feature_names"]
        )
        db.add(db_features)
        db_pred = ModelPrediction(
            assessment_id=unique_id,
            prediction=ml_output["prediction"],
            model_confidence=ml_output["model_confidence"],
            raw_stroke_probability=ml_output.get("raw_stroke_probability"),
            model_version=ml_output["model_version"],
            algorithm_used=ml_output["algorithm_used"]
        )
        db.add(db_pred)
        db_xai = XaiResult(
            assessment_id=unique_id,
            method="SHAP Multi-View",
            top_contributing_features=ml_output["explanation"],
            explanation_summary=ml_output["summary_text"]
        )
        db.add(db_xai)
        db_monitoring = MonitoringRecord(
            patient_id=patient_id,
            assessment_id=unique_id,
            facial_symmetry=db_features.facial_symmetry,
            eye_symmetry=db_features.eye_symmetry,
            eyebrow_symmetry=db_features.eyebrow_symmetry,
            mouth_symmetry=db_features.mouth_symmetry,
            nose_alignment=db_features.nose_alignment,
            overall_asymmetry=round(100.0 - db_features.facial_symmetry, 1),
            prediction_state=ml_output["prediction"],
            reliability_score=mean_rel,
            reliability_category=neutral_val["reliability_category"]
        )
        db.add(db_monitoring)
        db.commit()

    return {
        "prediction": ml_output["prediction"],
        "prediction_display": ml_output["prediction_display"],
        "model_confidence": ml_output["model_confidence"],
        "session_type": "MULTI_IMAGE",
        "views_processed": processed_views,
        "input_reliability": {
            "score": round(float(np.mean([v["reliability_score"] for v in processed_views])), 1),
            "category": neutral_val["reliability_category"],
            "authenticity_status": neutral_val["authenticity_status"]
        },
        "facial_features": {
            "facial_symmetry": neutral_features["facial_symmetry"],
            "eye_symmetry": neutral_features["eye_symmetry"],
            "eyebrow_symmetry": neutral_features["eyebrow_symmetry"],
            "mouth_symmetry": neutral_features["mouth_symmetry"],
            "nose_alignment": neutral_features["nose_alignment"],
            "jaw_symmetry": neutral_features["jaw_symmetry"]
        },
        "explanation": ml_output["explanation"],
        "assessment_id": unique_id,
        "image_url": f"/uploads/{img_filename}",
        "annotated_image_url": f"/uploads/{annotated_filename}",
        "ui_landmarks": neutral_features["ui_landmarks"],
        "summary_text": ml_output["summary_text"],
        "disclaimer": EMERGENCY_CARE_DISCLAIMER
    }

@router.post("/screening/assistant")
def ai_result_explanation_assistant(
    req: AssistantQuestionRequest,
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """
    Educational AI Result Explanation Assistant:
    Answers questions about measured biomarkers, confidence, and system boundaries
    without providing a clinical diagnosis or prescribing treatments.
    """
    q = req.question.strip().lower()

    if "mouth" in q or "lip" in q or "corner" in q:
        answer = (
            "Mouth symmetry measures the horizontal and vertical alignment of your left and right oral commissures "
            "(corners of the mouth) relative to the mid-sagittal facial axis. In clinical literature, unilateral oral "
            "depression or angle divergence can correlate with facial nerve paresis. Our model tracks whether this asymmetry "
            "is acute or matches historical baseline resting geometry."
        )
    elif "confidence" in q:
        conf_pct = int((req.model_confidence or 0.85) * 100)
        answer = (
            f"The displayed model confidence ({conf_pct}%) indicates how strongly the extracted geometric landmark pattern "
            f"aligns with the stroke-associated vs non-stroke cohorts in the model's trained validation dataset. "
            "It is NOT a medical probability of having a stroke; it represents algorithmic feature pattern certainty."
        )
    elif "eye" in q or "ptosis" in q or "eyebrow" in q:
        answer = (
            "Eye and eyebrow symmetry evaluate palpebral fissure aperture (eye-opening height) and frontalis arch elevation. "
            "A marked unilateral droop in eye opening can indicate ptosis or cranial nerve VII/III involvement, "
            "whereas symmetric eye movements generally support non-stroke baseline patterns."
        )
    elif "reliability" in q or "quality" in q:
        answer = (
            "Input Reliability reflects objective technical characteristics of your image: resolution, camera sharpness (Laplacian variance), "
            "even lighting, face-centering ratio, and the absence of smoothing filters or forced grimaces. High reliability ensures the "
            "AI's geometric landmark measurements are mathematically trustworthy."
        )
    elif "uncertain" in q or "unable to" in q:
        answer = (
            "An 'Unable to Reliably Assess' outcome occurs when image quality is low, excessive blur or shadows are detected, "
            "a beauty filter/smoothing is suspected, or facial expressions appear voluntarily forced. The system intentionally refuses "
            "to guess or force a binary outcome to prevent false positives."
        )
    elif "report" in q or "summary" in q or "explain" in q:
        pred_label = req.prediction or "completed assessment"
        mouth_val = req.mouth_symmetry or 85.0
        eye_val = req.eye_symmetry or 90.0
        answer = (
            f"Your assessment indicates a {pred_label.replace('_', ' ')} with mouth symmetry at {mouth_val}% and eye symmetry at {eye_val}%. "
            "Key landmark distances across the bilateral plane were evaluated using SHAP explainability. "
            "You can download the full PDF report or share it with your healthcare provider for clinical review."
        )
    else:
        answer = (
            "This educational assistant explains how facial landmarks, bilateral symmetry scores, and machine learning features "
            "are calculated. Remember that this application is an AI screening and research tool and not a clinical diagnosis. "
            "Always consult a qualified healthcare provider for clinical evaluations."
        )

    return {
        "question": req.question,
        "answer": answer,
        "disclaimer": EMERGENCY_CARE_DISCLAIMER
    }

@router.get("/screening/reminders")
def get_assessment_reminders(
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Retrieves patient assessment reminder settings."""
    p = current_patient or db.query(PatientProfile).first()
    if not p:
        return {"reminder_enabled": False, "reminder_frequency": "WEEKLY", "reminder_time": "09:00"}
    return {
        "reminder_enabled": p.reminder_enabled or False,
        "reminder_frequency": p.reminder_frequency or "WEEKLY",
        "reminder_time": p.reminder_time or "09:00"
    }

@router.post("/screening/reminders")
def update_assessment_reminders(
    req: ReminderSettingsRequest,
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Updates patient assessment reminder preferences."""
    p = current_patient or db.query(PatientProfile).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    p.reminder_enabled = req.reminder_enabled
    p.reminder_frequency = req.reminder_frequency
    p.reminder_time = req.reminder_time
    db.commit()
    return {"success": True, "message": "Assessment reminder preferences updated successfully."}

@router.get("/screening/privacy")
def get_privacy_settings(
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Retrieves privacy controls and data-sharing consent status."""
    p = current_patient or db.query(PatientProfile).first()
    pid = p.id if p else None
    count = db.query(Assessment).filter(Assessment.patient_id == pid).count() if pid else 0
    return {
        "data_sharing_consent": p.data_sharing_consent if p else False,
        "research_consent": p.research_consent if p else False,
        "total_stored_assessments": count,
        "auto_training_policy": "User images are strictly confidential and NEVER automatically added to the ML training dataset."
    }

@router.post("/screening/privacy/consent")
def update_privacy_consent(
    req: PrivacyConsentRequest,
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Updates patient research and data-sharing consent."""
    p = current_patient or db.query(PatientProfile).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    p.data_sharing_consent = req.data_sharing_consent
    p.research_consent = req.research_consent
    db.commit()
    return {"success": True, "message": "Privacy & consent preferences updated successfully."}

@router.post("/baseline")
def set_baseline_assessment(
    assessment_id: str = Form(...),
    notes: Optional[str] = Form("Personal physiological symmetry reference"),
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Sets a specific completed assessment as the patient's personal baseline reference."""
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    feats = a.facial_features
    if not feats:
        raise HTTPException(status_code=400, detail="Assessment has no facial feature data.")

    patient_id = a.patient_id
    # Unset previous baselines for this patient
    prev_baselines = db.query(BaselineAssessment).filter(BaselineAssessment.patient_id == patient_id).all()
    for b in prev_baselines:
        db.delete(b)

    # Mark assessment as baseline
    a.is_baseline = True

    baseline_entry = BaselineAssessment(
        patient_id=patient_id,
        assessment_id=a.id,
        reference_image_path=a.image_path,
        facial_symmetry=feats.facial_symmetry,
        eye_symmetry=feats.eye_symmetry,
        eyebrow_symmetry=feats.eyebrow_symmetry,
        mouth_symmetry=feats.mouth_symmetry,
        nose_alignment=feats.nose_alignment,
        notes=notes
    )
    db.add(baseline_entry)
    
    # Update profile reference
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if patient:
        patient.baseline_assessment_id = a.id

    db.commit()
    return {
        "success": True,
        "message": "Personal baseline assessment saved successfully.",
        "baseline_id": baseline_entry.id,
        "assessment_id": a.id,
        "baseline_metrics": {
            "facial_symmetry": feats.facial_symmetry,
            "eye_symmetry": feats.eye_symmetry,
            "eyebrow_symmetry": feats.eyebrow_symmetry,
            "mouth_symmetry": feats.mouth_symmetry,
            "nose_alignment": feats.nose_alignment
        }
    }

@router.get("/baseline")
def get_baseline_assessment(
    patient_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """Retrieves the current personal baseline facial assessment record."""
    pid = patient_id or (current_patient.id if current_patient else None)
    if not pid:
        demo_patient = db.query(PatientProfile).first()
        pid = demo_patient.id if demo_patient else None

    baseline = db.query(BaselineAssessment).filter(BaselineAssessment.patient_id == pid).first()
    if not baseline:
        return {"has_baseline": False, "baseline": None}

    assessment = db.query(Assessment).filter(Assessment.id == baseline.assessment_id).first()

    return {
        "has_baseline": True,
        "baseline": {
            "id": baseline.id,
            "assessment_id": baseline.assessment_id,
            "created_at": baseline.created_at.isoformat(),
            "reference_image_url": baseline.reference_image_path,
            "notes": baseline.notes,
            "measurements": {
                "facial_symmetry": baseline.facial_symmetry,
                "eye_symmetry": baseline.eye_symmetry,
                "eyebrow_symmetry": baseline.eyebrow_symmetry,
                "mouth_symmetry": baseline.mouth_symmetry,
                "nose_alignment": baseline.nose_alignment
            },
            "annotated_image_url": assessment.annotated_image_path if assessment else None
        }
    }

@router.get("/comparison")
def compare_assessments(
    assessment_a_id: Optional[str] = Query(None),
    assessment_b_id: Optional[str] = Query(None),
    use_baseline: bool = Query(False),
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """
    Compares two assessments (or Baseline vs Current Assessment).
    Returns numerical deltas and neutral comparative interpretation.
    """
    pid = current_patient.id if current_patient else None
    if not pid:
        demo_patient = db.query(PatientProfile).first()
        pid = demo_patient.id if demo_patient else None

    # Determine assessment A (Baseline or earlier assessment)
    if use_baseline:
        baseline = db.query(BaselineAssessment).filter(BaselineAssessment.patient_id == pid).first()
        if not baseline:
            raise HTTPException(status_code=404, detail="No personal baseline assessment set.")
        a_obj = db.query(Assessment).filter(Assessment.id == baseline.assessment_id).first()
    elif assessment_a_id:
        a_obj = db.query(Assessment).filter(Assessment.id == assessment_a_id).first()
    else:
        # Default: second most recent assessment
        recent = db.query(Assessment).filter(Assessment.patient_id == pid).order_by(Assessment.created_at.desc()).limit(2).all()
        if len(recent) > 1:
            a_obj = recent[1]
        elif len(recent) == 1:
            a_obj = recent[0]
        else:
            raise HTTPException(status_code=404, detail="Insufficient assessments available for comparison.")

    # Determine assessment B (Current or selected second assessment)
    if assessment_b_id:
        b_obj = db.query(Assessment).filter(Assessment.id == assessment_b_id).first()
    else:
        recent = db.query(Assessment).filter(Assessment.patient_id == pid).order_by(Assessment.created_at.desc()).first()
        b_obj = recent

    if not a_obj or not b_obj:
        raise HTTPException(status_code=404, detail="Could not resolve assessments for comparison.")

    f_a = a_obj.facial_features
    f_b = b_obj.facial_features

    if not f_a or not f_b:
        raise HTTPException(status_code=400, detail="One or both assessments lack facial feature data.")

    # Deltas = B - A
    delta_facial = round(f_b.facial_symmetry - f_a.facial_symmetry, 1)
    delta_eye = round(f_b.eye_symmetry - f_a.eye_symmetry, 1)
    delta_eyebrow = round(f_b.eyebrow_symmetry - f_a.eyebrow_symmetry, 1)
    delta_mouth = round(f_b.mouth_symmetry - f_a.mouth_symmetry, 1)
    delta_nose = round(f_b.nose_alignment - f_a.nose_alignment, 1)

    interpretation = (
        f"Compared to Assessment #{a_obj.id[:8]}, Assessment #{b_obj.id[:8]} shows "
        f"{'an increase' if delta_facial > 0 else ('a decrease' if delta_facial < 0 else 'no change')} "
        f"of {abs(delta_facial)} points in overall facial symmetry index. "
        f"Mouth symmetry shifted by {delta_mouth:+} pts, eye opening symmetry by {delta_eye:+} pts, "
        f"and eyebrow symmetry by {delta_eyebrow:+} pts."
    )

    return {
        "assessment_a": {
            "id": a_obj.id,
            "created_at": a_obj.created_at.isoformat(),
            "is_baseline": a_obj.is_baseline,
            "image_url": a_obj.image_path,
            "annotated_image_url": a_obj.annotated_image_path,
            "prediction": a_obj.model_prediction.prediction if a_obj.model_prediction else "non_stroke_associated",
            "measurements": {
                "facial_symmetry": f_a.facial_symmetry,
                "eye_symmetry": f_a.eye_symmetry,
                "eyebrow_symmetry": f_a.eyebrow_symmetry,
                "mouth_symmetry": f_a.mouth_symmetry,
                "nose_alignment": f_a.nose_alignment,
                "jaw_symmetry": f_a.jaw_symmetry
            }
        },
        "assessment_b": {
            "id": b_obj.id,
            "created_at": b_obj.created_at.isoformat(),
            "is_baseline": b_obj.is_baseline,
            "image_url": b_obj.image_path,
            "annotated_image_url": b_obj.annotated_image_path,
            "prediction": b_obj.model_prediction.prediction if b_obj.model_prediction else "non_stroke_associated",
            "measurements": {
                "facial_symmetry": f_b.facial_symmetry,
                "eye_symmetry": f_b.eye_symmetry,
                "eyebrow_symmetry": f_b.eyebrow_symmetry,
                "mouth_symmetry": f_b.mouth_symmetry,
                "nose_alignment": f_b.nose_alignment,
                "jaw_symmetry": f_b.jaw_symmetry
            }
        },
        "deltas": {
            "facial_symmetry": delta_facial,
            "eye_symmetry": delta_eye,
            "eyebrow_symmetry": delta_eyebrow,
            "mouth_symmetry": delta_mouth,
            "nose_alignment": delta_nose
        },
        "interpretation": interpretation
    }

@router.get("/monitoring")
def get_longitudinal_monitoring(
    patient_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_patient: Optional[PatientProfile] = Depends(get_current_patient_optional)
):
    """
    Returns longitudinal measurements across assessments over time
    formatted for Recharts visualization.
    """
    pid = patient_id or (current_patient.id if current_patient else None)
    if not pid:
        demo_patient = db.query(PatientProfile).first()
        pid = demo_patient.id if demo_patient else None

    records = db.query(MonitoringRecord).filter(
        MonitoringRecord.patient_id == pid
    ).order_by(MonitoringRecord.recorded_date.asc()).all()

    timeline = []
    for idx, r in enumerate(records):
        timeline.append({
            "index": idx + 1,
            "date": r.recorded_date.strftime("%d %b %Y"),
            "timestamp": r.recorded_date.isoformat(),
            "assessment_id": r.assessment_id,
            "facial_symmetry": r.facial_symmetry,
            "eye_symmetry": r.eye_symmetry,
            "eyebrow_symmetry": r.eyebrow_symmetry,
            "mouth_symmetry": r.mouth_symmetry,
            "nose_alignment": r.nose_alignment,
            "overall_asymmetry": r.overall_asymmetry,
            "prediction": r.prediction_state
        })

    # Summary statistics
    if timeline:
        sym_values = [t["facial_symmetry"] for t in timeline]
        summary_stats = {
            "total_assessments": len(timeline),
            "current_symmetry": sym_values[-1],
            "average_symmetry": round(float(np.mean(sym_values)), 1),
            "min_symmetry": min(sym_values),
            "max_symmetry": max(sym_values),
            "trend": "Stable" if len(sym_values) < 2 else (
                "Improving" if sym_values[-1] > sym_values[0] + 3 else (
                    "Decreasing" if sym_values[-1] < sym_values[0] - 3 else "Stable"
                )
            )
        }
    else:
        summary_stats = {
            "total_assessments": 0,
            "current_symmetry": None,
            "average_symmetry": None,
            "min_symmetry": None,
            "max_symmetry": None,
            "trend": "No data"
        }

    return {
        "timeline": timeline,
        "summary": summary_stats
    }
