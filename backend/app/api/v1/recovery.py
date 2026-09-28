from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_patient
from app.models.user import PatientProfile
from app.models.recovery import RecoveryRecord, SymptomEvent
from app.schemas.recovery import RecoveryLogCreate, RecoveryRecordOut, SymptomEventCreate, SymptomEventOut

router = APIRouter(prefix="/recovery", tags=["Recovery & Symptom Timeline"])

@router.post("/log", response_model=RecoveryRecordOut)
def log_recovery(
    data: RecoveryLogCreate,
    patient: PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    record = RecoveryRecord(
        patient_id=patient.id,
        record_date=data.record_date or date.today(),
        facial_movement_score=data.facial_movement_score,
        speech_practice_minutes=data.speech_practice_minutes,
        exercise_completed=data.exercise_completed,
        therapist_goals=data.therapist_goals,
        patient_notes=data.patient_notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/summary")
def get_recovery_summary(
    patient: PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    records = db.query(RecoveryRecord).filter(
        RecoveryRecord.patient_id == patient.id
    ).order_by(RecoveryRecord.record_date.asc()).all()

    total_speech_mins = sum(r.speech_practice_minutes for r in records)
    total_sessions = len(records)
    
    timeline_data = [
        {
            "id": r.id,
            "date": r.record_date.isoformat(),
            "facial_movement_score": r.facial_movement_score,
            "speech_practice_minutes": r.speech_practice_minutes,
            "exercise_completed": r.exercise_completed,
            "therapist_goals": r.therapist_goals,
            "patient_notes": r.patient_notes
        }
        for r in records
    ]

    return {
        "total_sessions": total_sessions,
        "total_speech_minutes": total_speech_mins,
        "timeline": timeline_data
    }

@router.post("/symptom", response_model=SymptomEventOut)
def log_symptom_event(
    event: SymptomEventCreate,
    patient: PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Logs timestamped acute symptom onset for B.E. F.A.S.T. clinical timeline."""
    new_event = SymptomEvent(
        patient_id=patient.id,
        symptom_category=event.symptom_category,
        symptom_started_at=event.symptom_started_at,
        description=event.description,
        emergency_mode_engaged=event.emergency_mode_engaged
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/symptoms")
def get_symptom_timeline(
    patient: PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    events = db.query(SymptomEvent).filter(
        SymptomEvent.patient_id == patient.id
    ).order_by(SymptomEvent.symptom_started_at.desc()).all()

    return [
        {
            "id": e.id,
            "symptom_category": e.symptom_category,
            "symptom_started_at": e.symptom_started_at.isoformat(),
            "description": e.description,
            "emergency_mode_engaged": e.emergency_mode_engaged,
            "created_at": e.created_at.isoformat()
        }
        for e in events
    ]
