from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_patient
from app.models.user import PatientProfile
from app.models.risk_factors import RiskFactorRecord
from app.schemas.risk import RiskFactorInput, RiskFactorOut

router = APIRouter(prefix="/risk-factors", tags=["Risk Factor Assessment"])

def evaluate_lifestyle_risk_factors(data: RiskFactorInput) -> tuple[int, list[str], str]:
    """
    Evaluates evidence-based stroke risk factors according to clinical guidelines
    (AHA / ASA Stroke Guidelines) without presenting unsupported predictive percentages.
    """
    flagged = []
    
    if data.age >= 55:
        flagged.append(f"Age Indicator ({data.age} years)")
    if data.hypertension:
        flagged.append("Elevated Blood Pressure / Hypertension")
    if data.heart_disease:
        flagged.append("Pre-existing Cardiovascular / Heart Condition")
    if data.diabetes:
        flagged.append("Diabetes / Elevated Glycemic Variability")
    if data.smoking_status in ["current", "formerly"]:
        flagged.append(f"Tobacco Exposure ({data.smoking_status.title()} Smoker)")
    if data.physical_activity == "low":
        flagged.append("Sedentary Lifestyle / Low Physical Activity")
    if data.bmi and data.bmi >= 30.0:
        flagged.append(f"Body Mass Index ({data.bmi:.1f} kg/m² — Obese Category)")
    if data.avg_glucose_level and data.avg_glucose_level >= 140.0:
        flagged.append(f"Elevated Blood Glucose ({data.avg_glucose_level:.1f} mg/dL)")
    if data.prior_transient_ischemic_attack:
        flagged.append("Prior Transient Ischemic Attack (TIA) History")
    if data.family_stroke_history:
        flagged.append("Family History of Stroke or Cerebrovascular Disease")

    count = len(flagged)
    
    if count == 0:
        advice = "Your lifestyle and health profile does not indicate conventional major risk factors. Maintain regular physical activity and annual health screenings."
    elif count <= 2:
        advice = f"You have {count} factor(s) requiring attention. Modifying daily habits (e.g. nutrition, cardiovascular exercise) and discussing these with your primary doctor can significantly promote long-term cerebrovascular health."
    else:
        advice = f"You have {count} health factor(s) identified for medical attention. We strongly recommend scheduling a comprehensive consultation with a healthcare professional or cardiologist to optimize blood pressure, metabolic markers, and preventive care."

    return count, flagged, advice

@router.post("/assess", response_model=RiskFactorOut)
def submit_risk_assessment(
    data: RiskFactorInput,
    patient: PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    count, flagged, advice = evaluate_lifestyle_risk_factors(data)
    
    record = RiskFactorRecord(
        patient_id=patient.id,
        age=data.age,
        hypertension=data.hypertension,
        heart_disease=data.heart_disease,
        diabetes=data.diabetes,
        smoking_status=data.smoking_status,
        physical_activity=data.physical_activity,
        bmi=data.bmi,
        avg_glucose_level=data.avg_glucose_level,
        family_stroke_history=data.family_stroke_history,
        prior_transient_ischemic_attack=data.prior_transient_ischemic_attack,
        attention_risk_count=count,
        flagged_factors=flagged,
        educational_advice=advice
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/latest", response_model=RiskFactorOut)
def get_latest_risk_assessment(
    patient: PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    latest = db.query(RiskFactorRecord).filter(
        RiskFactorRecord.patient_id == patient.id
    ).order_by(RiskFactorRecord.created_at.desc()).first()
    
    if not latest:
        raise HTTPException(status_code=404, detail="No risk factor assessment recorded yet.")
    return latest

@router.get("/history")
def get_risk_history(
    patient: PatientProfile = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    records = db.query(RiskFactorRecord).filter(
        RiskFactorRecord.patient_id == patient.id
    ).order_by(RiskFactorRecord.created_at.desc()).all()
    
    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "attention_risk_count": r.attention_risk_count,
            "flagged_factors": r.flagged_factors or [],
            "bmi": r.bmi,
            "avg_glucose_level": r.avg_glucose_level,
            "educational_advice": r.educational_advice
        }
        for r in records
    ]
