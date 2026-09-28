import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, PatientProfile, Doctor
from app.models.screening import (
    Assessment,
    FacialFeatures,
    Landmarks,
    ModelPrediction,
    XaiResult,
    BaselineAssessment,
    MonitoringRecord
)
from app.models.report import ReportRecord, DoctorPatientAccess
from app.models.system import ModelVersion, AuditLog, Notification

from app.api.v1.auth import router as auth_router
from app.api.v1.screening import router as screening_router
from app.api.v1.doctor import router as doctor_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router
from app.api.v1.risk_factors import router as risk_factors_router
from app.api.v1.recovery import router as recovery_router
from app.api.v1.assistant import router as assistant_router

app = FastAPI(
    title="Stroke Recognition AI",
    version=settings.VERSION,
    description="Explainable AI-Based Stroke Recognition Using Facial Asymmetry and Facial Landmark Sequence Analysis with Machine Learning",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded media directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers matching API specifications
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(screening_router, prefix=settings.API_V1_STR)
app.include_router(doctor_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(risk_factors_router, prefix=settings.API_V1_STR)
app.include_router(recovery_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Stroke Recognition AI API",
        "version": settings.VERSION,
        "primary_modality": "MediaPipe 468 Landmarks + Machine Learning + SHAP XAI"
    }

# Mount Frontend Built SPA if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str, request: Request):
        # Allow API routes and docs to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

@app.on_event("startup")
def on_startup():
    # 1. Create DB tables
    Base.metadata.create_all(bind=engine)

    # 2. Seed default accounts for testing and demonstration
    db = SessionLocal()
    try:
        # Patient Sarah
        patient_user = db.query(User).filter(User.email == "patient@strokecare.ai").first()
        if not patient_user:
            patient_user = User(
                email="patient@strokecare.ai",
                hashed_password=get_password_hash("patient123"),
                full_name="Sarah Jenkins",
                role="PATIENT",
                is_active=True
            )
            db.add(patient_user)
            db.commit()
            db.refresh(patient_user)
            
            p_profile = PatientProfile(
                user_id=patient_user.id,
                gender="Female",
                phone="+1 (555) 234-8901"
            )
            db.add(p_profile)
            db.commit()
            db.refresh(p_profile)

            # Seed a sample baseline assessment for Sarah
            sample_baseline_id = "sample-baseline-sarah"
            if not db.query(Assessment).filter(Assessment.id == sample_baseline_id).first():
                base_assess = Assessment(
                    id=sample_baseline_id,
                    patient_id=p_profile.id,
                    assessment_type="LIVE_CAMERA",
                    quality_status="PASSED",
                    is_baseline=True
                )
                db.add(base_assess)

                base_feats = FacialFeatures(
                    assessment_id=sample_baseline_id,
                    facial_symmetry=92.4,
                    eye_symmetry=95.0,
                    eyebrow_symmetry=91.5,
                    mouth_symmetry=89.2,
                    nose_alignment=93.0,
                    jaw_symmetry=93.3,
                    lower_face_asymmetry=0.08,
                    landmark_displacement_mean=0.04
                )
                db.add(base_feats)

                base_pred = ModelPrediction(
                    assessment_id=sample_baseline_id,
                    prediction="non_stroke_associated",
                    model_confidence=0.92,
                    model_version="v1.0",
                    algorithm_used="XGBoost"
                )
                db.add(base_pred)

                base_entry = BaselineAssessment(
                    patient_id=p_profile.id,
                    assessment_id=sample_baseline_id,
                    facial_symmetry=92.4,
                    eye_symmetry=95.0,
                    eyebrow_symmetry=91.5,
                    mouth_symmetry=89.2,
                    nose_alignment=93.0,
                    notes="Baseline physiological facial symmetry profile."
                )
                db.add(base_entry)

                # Seed monitoring record
                db_mon = MonitoringRecord(
                    patient_id=p_profile.id,
                    assessment_id=sample_baseline_id,
                    facial_symmetry=92.4,
                    eye_symmetry=95.0,
                    eyebrow_symmetry=91.5,
                    mouth_symmetry=89.2,
                    nose_alignment=93.0,
                    overall_asymmetry=7.6,
                    prediction_state="non_stroke_associated"
                )
                db.add(db_mon)

                p_profile.baseline_assessment_id = sample_baseline_id
                db.commit()

        # Doctor Marcus
        doctor_user = db.query(User).filter(User.email == "doctor@strokecare.ai").first()
        if not doctor_user:
            doctor_user = User(
                email="doctor@strokecare.ai",
                hashed_password=get_password_hash("doctor123"),
                full_name="Dr. Marcus Vance, MD",
                role="DOCTOR",
                is_active=True
            )
            db.add(doctor_user)
            db.commit()
            db.refresh(doctor_user)

            doc_profile = Doctor(
                user_id=doctor_user.id,
                license_number="NEURO-88942-CA",
                hospital_affiliation="Metropolitan Stroke Center",
                specialty="Vascular Neurology & Facial Asymmetry"
            )
            db.add(doc_profile)
            db.commit()
            db.refresh(doc_profile)

            # Link Sarah to Dr. Marcus
            sarah = db.query(User).filter(User.email == "patient@strokecare.ai").first()
            if sarah and sarah.patient_profile:
                access = DoctorPatientAccess(doctor_id=doc_profile.id, patient_id=sarah.patient_profile.id, status="APPROVED")
                db.add(access)
                db.commit()

        # Admin
        admin_user = db.query(User).filter(User.email == "admin@strokecare.ai").first()
        if not admin_user:
            admin_user = User(
                email="admin@strokecare.ai",
                hashed_password=get_password_hash("admin123"),
                full_name="AI Systems Administrator",
                role="ADMIN",
                is_active=True
            )
            db.add(admin_user)
            db.commit()

        # Seed initial audit log
        if db.query(AuditLog).count() == 0:
            log1 = AuditLog(
                action="SYSTEM_INITIALIZED",
                resource_type="System",
                details={"version": settings.VERSION, "models_loaded": ["XGBoost", "RandomForest", "SVM", "LogisticRegression"]}
            )
            db.add(log1)
            db.commit()

    except Exception as e:
        db.rollback()
        print(f"Startup database seeding note: {e}")
    finally:
        db.close()
