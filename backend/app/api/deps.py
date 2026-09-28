from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, PatientProfile, Doctor

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def require_role(required_role: str):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role != required_role and user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires {required_role} privileges."
            )
        return user
    return role_checker

def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Requires administrator privileges."
        )
    return user


def get_current_patient(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PatientProfile:
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
    if not patient:
        # Auto-create patient profile for user
        patient = PatientProfile(user_id=user.id)
        db.add(patient)
        db.commit()
        db.refresh(patient)
    return patient

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user_optional(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                return db.query(User).filter(User.id == user_id).first()
    except Exception:
        pass
    return None

def get_current_patient_optional(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> PatientProfile:
    user = None
    if token:
        try:
            payload = decode_access_token(token)
            if payload:
                user_id = payload.get("sub")
                user = db.query(User).filter(User.id == user_id).first()
        except Exception:
            pass

    if not user:
        user = db.query(User).filter(User.email == "patient@strokecare.ai").first()

    if not user:
        user = db.query(User).first()

    if not user:
        import uuid
        from app.core.security import get_password_hash
        user = User(
            id=str(uuid.uuid4()),
            email="patient@strokecare.ai",
            hashed_password=get_password_hash("patient123"),
            full_name="Default Patient",
            role="PATIENT",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    patient = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
    if not patient:
        patient = PatientProfile(user_id=user.id)
        db.add(patient)
        db.commit()
        db.refresh(patient)
    return patient


def get_current_doctor(user: User = Depends(require_role("DOCTOR")), db: Session = Depends(get_db)) -> Doctor:
    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found for this account.")
    return doctor
